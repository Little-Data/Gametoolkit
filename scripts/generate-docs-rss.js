const fs = require('fs-extra');
const path = require('path');
const RSS = require('rss');
const matter = require('gray-matter');
const glob = require('glob');
const { execSync } = require('child_process');

// 站点配置
const SITE_CONFIG = {
  url: 'https://little-data.github.io/',
  baseUrl: '/Gametoolkit',
  title: 'Gametoolkit - 文档 RSS',
  description: 'Gametoolkit - 文档 RSS',
  language: 'zh-Hans',
  maxItems: 15,
  excludePaths: [
    'docs/01-index.md',
  ],
};

// 项目根目录（统一基准）
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DOCS_SRC_DIR = path.join(PROJECT_ROOT, 'docs');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'build/docs/rss.xml');

/**
 * 工具函数：转换为POSIX风格的绝对路径（跨平台统一）
 */
function toPosixAbsolutePath(filePath, baseDir = PROJECT_ROOT) {
  const absolutePath = path.resolve(baseDir, filePath);
  return path.posix.normalize(absolutePath.replace(/\\/g, '/'));
}

/**
 * 工具函数：判断路径是否为文件（支持存在/不存在的路径，结合glob规则）
 * @param {string} filePath 路径（绝对/相对）
 * @returns {boolean} true=文件，false=文件夹/不存在/glob规则
 */
function isFilePath(filePath) {
  // 排除glob通配符路径
  if (glob.hasMagic(filePath)) return false;
  const absolutePath = toPosixAbsolutePath(filePath);
  try {
    // 存在的路径：判断是否为文件
    return fs.statSync(absolutePath).isFile();
  } catch (err) {
    // 不存在的路径：根据扩展名判断（如.md/.js为文件，无扩展名为文件夹）
    return path.extname(absolutePath) !== '';
  }
}

/**
 * 工具函数：移除字符串开头的数字-前缀
 */
function removeLeadingNumberPrefix(str) {
  return str.replace(/^\d+-/, '');
}

/**
 * 工具函数：移除路径末尾的index
 */
function removeTrailingIndex(pathStr) {
  return pathStr.replace(/(\/|^)index$/, '');
}

/**
 * 工具函数：获取文件对应的处理后简洁路径（与生成RSS条目时的路径一致）
 */
function getProcessedCleanPath(filePath) {
  // 非文件路径直接返回空（避免非文件调用）
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return '';
  }
  const absoluteFilePath = toPosixAbsolutePath(filePath);
  const relativePath = path.relative(DOCS_SRC_DIR, absoluteFilePath).replace(/\\/g, '/');
  let cleanPath = relativePath.replace(/\.md$/, '');
  // 移除路径片段的数字前缀
  cleanPath = cleanPath.split('/').map(part => removeLeadingNumberPrefix(part)).join('/');
  // 移除末尾的index
  cleanPath = removeTrailingIndex(cleanPath);
  // 处理文件名与父文件夹同名的情况
  const originalFileName = path.basename(absoluteFilePath, '.md');
  const fileName = removeLeadingNumberPrefix(originalFileName);
  const parentFolderName = removeLeadingNumberPrefix(path.basename(path.dirname(absoluteFilePath)));
  const parentFolderRelativePath = path.relative(DOCS_SRC_DIR, path.dirname(absoluteFilePath))
    .replace(/\\/g, '/')
    .split('/')
    .map(part => removeLeadingNumberPrefix(part))
    .join('/');
  if (fileName === parentFolderName) {
    cleanPath = parentFolderRelativePath ? parentFolderRelativePath : fileName;
  }
  // 拼接docs前缀（与生成RSS时的路径一致）
  return path.posix.join('docs', cleanPath).replace(/\/$/, '');
}

/**
 * 判断路径是否匹配排除规则（严格区分文件/文件夹规则）
 */
function isPathExcluded(pathToCheck, excludePaths, baseDir = PROJECT_ROOT) {
  if (!excludePaths || excludePaths.length === 0) {
    return false;
  }

  const normalizedPath = toPosixAbsolutePath(pathToCheck, baseDir);
  const systemBaseDir = path.resolve(baseDir);
  // 仅当pathToCheck是文件时，才生成处理后路径（避免文件夹路径的误匹配）
  const isCheckFile = fs.existsSync(normalizedPath) ? fs.statSync(normalizedPath).isFile() : isFilePath(pathToCheck);
  const processedCleanPath = isCheckFile ? getProcessedCleanPath(normalizedPath) : '';

  for (const excludePath of excludePaths) {
    const normalizedExcludePath = toPosixAbsolutePath(excludePath, baseDir);
    // 判断排除规则的类型：文件/文件夹
    const isExcludeFile = isFilePath(excludePath);
    // 排除规则对应的处理后路径（仅文件规则需要）
    const excludeProcessedCleanPath = isExcludeFile ? getProcessedCleanPath(normalizedExcludePath) : '';

    // 情况1：排除规则是glob通配符
    if (glob.hasMagic(excludePath)) {
      const matchedPaths = glob.sync(excludePath, {
        cwd: systemBaseDir,
        absolute: true,
        nodir: true // 只匹配文件，避免文件夹匹配
      }).map(p => toPosixAbsolutePath(p));
      // glob规则仅精准匹配文件路径，不触发子路径
      if (matchedPaths.includes(normalizedPath)) {
        return true;
      }
    }
    // 情况2：排除规则是普通路径（文件/文件夹）
    else {
      // 子逻辑1：文件规则 → 仅允许精准匹配（原始路径 或 处理后路径）
      if (isExcludeFile) {
        const isMatched = (
          normalizedPath === normalizedExcludePath || // 原始文件路径精准匹配
          (processedCleanPath && processedCleanPath === excludeProcessedCleanPath) // 处理后路径精准匹配
        );
        if (isMatched) {
          return true;
        }
      }
      // 子逻辑2：文件夹规则 → 精准匹配 + 子路径匹配（仅文件夹规则触发）
      else {
        const isMatched = (
          normalizedPath === normalizedExcludePath || // 文件夹路径精准匹配
          normalizedPath.startsWith(normalizedExcludePath + '/') // 子路径匹配
        );
        if (isMatched) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * 工具函数：处理文件名为直接父文件夹同名的情况
 */
function removeSameNameFileNamePart(filePath, cleanRelativePath) {
  const originalFileName = path.basename(filePath, '.md');
  const fileName = removeLeadingNumberPrefix(originalFileName);
  const parentFolderName = removeLeadingNumberPrefix(path.basename(path.dirname(filePath)));
  const parentFolderRelativePath = path.relative(DOCS_SRC_DIR, path.dirname(filePath))
    .replace(/\\/g, '/')
    .split('/')
    .map(part => removeLeadingNumberPrefix(part))
    .join('/');

  if (fileName === parentFolderName) {
    return parentFolderRelativePath ? parentFolderRelativePath : fileName;
  }
  return cleanRelativePath;
}

/**
 * 获取文件的最后更新时间
 */
function getFileLastUpdatedTime(filePath) {
  try {
    const log = execSync(`git log -1 --format=%cd --date=iso "${filePath.replace(/"/g, '\\"')}"`, {
      encoding: 'utf8',
      cwd: PROJECT_ROOT
    });
    return new Date(log.trim());
  } catch (err) {
    const stats = fs.statSync(filePath);
    return stats.mtime;
  }
}

/**
 * 生成 Docs RSS
 */
async function generateDocsRSS() {
  try {
    if (!fs.existsSync(DOCS_SRC_DIR)) {
      throw new Error(`Docs 源目录不存在：${DOCS_SRC_DIR}`);
    }

    await fs.ensureDir(path.dirname(OUTPUT_PATH));

    // 遍历docs下的所有md文件（基于项目根目录）
    const mdFiles = glob.sync('docs/**/*.md', {
      cwd: PROJECT_ROOT,
      ignore: ['**/node_modules/**', '**/.git/**', '**/_*.md'],
      absolute: true
    });

    if (mdFiles.length === 0) {
      throw new Error('Docs 目录下未找到 Markdown 文档');
    }

    // 初始化RSS实例
    const siteUrl = new URL(SITE_CONFIG.baseUrl, SITE_CONFIG.url).href;
    const feedUrl = new URL('docs/rss.xml', siteUrl).href;
    const feed = new RSS({
      title: SITE_CONFIG.title,
      description: SITE_CONFIG.description,
      site_url: siteUrl,
      feed_url: feedUrl,
      language: SITE_CONFIG.language,
      pubDate: new Date(),
    });

    const processedPaths = new Set();
    const docsData = [];

    for (const file of mdFiles) {
      // 第一步：过滤排除路径的文件（原始文件路径）
      if (isPathExcluded(file, SITE_CONFIG.excludePaths)) {
        continue;
      }

      const content = fs.readFileSync(file, 'utf8');
      const { data: frontMatter } = matter(content);

      // 过滤草稿/隐藏文档
      if (frontMatter.draft || frontMatter.hide) {
        continue;
      }

      // 处理文档标题
      const originalFileName = path.basename(file, '.md');
      const processedFileName = removeLeadingNumberPrefix(originalFileName);
      const title = frontMatter.title || processedFileName;

      // 处理文档相对路径（适配Docusaurus路由）
      const relativePath = path.relative(DOCS_SRC_DIR, file).replace(/\\/g, '/');
      let cleanRelativePath = relativePath.replace(/\.md$/, '');
      cleanRelativePath = cleanRelativePath.split('/').map(part => removeLeadingNumberPrefix(part)).join('/');
      cleanRelativePath = removeSameNameFileNamePart(file, cleanRelativePath);
      cleanRelativePath = removeTrailingIndex(cleanRelativePath);

      // 拼接处理后的路径
      const processedRelativePath = path.posix.join('docs', cleanRelativePath).replace(/\/$/, '');
      // 第二步：过滤已处理的路径或排除的路径
      if (isPathExcluded(processedRelativePath, SITE_CONFIG.excludePaths) || processedPaths.has(processedRelativePath)) {
        continue;
      }
      processedPaths.add(processedRelativePath);

      // 生成永久链接和更新时间
      const permalink = path.posix.join(SITE_CONFIG.baseUrl, processedRelativePath);
      const lastUpdatedAt = getFileLastUpdatedTime(file);

      docsData.push({
        title,
        permalink,
        lastUpdatedAt,
        file,
      });
    }

    // 按更新时间排序并截取最大数量
    // 时间相同时按文件路径排序，确保跨平台一致性
    const sortedDocs = docsData.sort((a, b) => {
      // 主要排序：按更新时间降序
      const timeDiff = b.lastUpdatedAt - a.lastUpdatedAt;
      if (timeDiff !== 0) {
        return timeDiff;
      }
      // 次要排序：按文件路径升序
      return a.file.localeCompare(b.file);
    });
    const limitedDocs = sortedDocs.slice(0, SITE_CONFIG.maxItems);

    // 添加RSS条目
    limitedDocs.forEach((doc) => {
      const docUrl = new URL(doc.permalink, SITE_CONFIG.url).href;
      const guid = doc.permalink.replace(/\\/g, '/');
      feed.item({
        title: doc.title,
        url: docUrl,
        guid: guid,
        guid_isPermaLink: false,
        date: doc.lastUpdatedAt,
      });
    });

    // 写入RSS文件
    const xml = feed.xml({ indent: true });
    await fs.writeFile(OUTPUT_PATH, xml, 'utf8');

    console.log(`Docs RSS 生成成功：${OUTPUT_PATH}`);
    console.log(`共处理 ${sortedDocs.length} 篇文档，最终输出 ${limitedDocs.length} 篇`);
  } catch (error) {
    console.error('Docs RSS 生成失败：', error.message);
    process.exit(1);
  }
}

// 执行脚本
generateDocsRSS();