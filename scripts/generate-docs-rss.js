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
  maxItems: 15, // RSS生成的最大文章个数
  excludePaths: [ // 需要排除的路径（支持glob通配符、绝对/相对路径、处理后的路径）
    'docs/01-index.md',
  ],
};

// Docs 源文件目录（你的 Markdown 文档目录）
const DOCS_SRC_DIR = path.join(__dirname, '../docs');
// RSS 输出路径
const OUTPUT_PATH = path.join(__dirname, '../build/docs/rss.xml');

/**
 * 工具函数：将路径转换为POSIX风格的绝对路径（跨平台统一）
 * @param {string} filePath 任意路径（相对/绝对、POSIX/Windows）
 * @param {string} baseDir 基准目录（默认当前工作目录）
 * @returns {string} POSIX风格的绝对路径（/分隔符）
 */
function toPosixAbsolutePath(filePath, baseDir = process.cwd()) {
  // 先解析为系统原生的绝对路径，再转换为POSIX风格并规范化
  const absolutePath = path.resolve(baseDir, filePath);
  return path.posix.normalize(absolutePath.replace(/\\/g, '/'));
}

/**
 * 工具函数：移除字符串开头的数字-前缀（如 01-、123-）
 * @param {string} str 原始字符串（文件名或路径片段）
 * @returns {string} 处理后的字符串
 */
function removeLeadingNumberPrefix(str) {
  // 正则匹配开头的一个或多个数字 + 连字符，替换为空
  return str.replace(/^\d+-/, '');
}

/**
 * 工具函数：移除路径末尾的index（包括/index或index）
 * @param {string} pathStr 原始路径
 * @returns {string} 处理后的路径
 */
function removeTrailingIndex(pathStr) {
  // 匹配末尾的 /index 或 index（支持带/和不带/的情况）
  return pathStr.replace(/(\/|^)index$/, '');
}

/**
 * 工具函数：判断路径是否匹配排除规则（支持原始文件路径、处理后的路径）
 * @param {string} pathToCheck 要检查的路径（可以是原始文件路径、处理后的相对路径）
 * @param {string[]} excludePaths 排除的路径规则（支持glob通配符）
 * @param {string} baseDir 基准目录（用于相对路径转换）
 * @returns {boolean} true表示需要排除，false表示保留
 */
function isPathExcluded(pathToCheck, excludePaths, baseDir = __dirname) {
  if (!excludePaths || excludePaths.length === 0) {
    return false;
  }

  // 转换为POSIX风格的绝对路径（跨平台统一）
  const normalizedPath = toPosixAbsolutePath(pathToCheck, baseDir);
  // 系统原生的基准目录（用于glob的cwd参数，确保IO操作正确）
  const systemBaseDir = path.resolve(baseDir);

  // 遍历排除规则，判断是否匹配
  for (const excludePath of excludePaths) {
    // 转换排除规则为POSIX风格的绝对路径
    const normalizedExcludePath = toPosixAbsolutePath(excludePath, baseDir);
    
    // 情况1：排除规则是glob通配符
    if (glob.hasMagic(excludePath)) {
      // glob使用系统原生路径作为cwd，匹配后转换为POSIX绝对路径
      const matchedPaths = glob.sync(excludePath, { 
        cwd: systemBaseDir, // 系统原生路径，确保Linux下glob能正确查找
        absolute: true,
        nodir: true // 只匹配文件（避免文件夹匹配）
      }).map(p => toPosixAbsolutePath(p)); // 统一转换为POSIX风格路径

      // 检查当前路径是否在匹配结果中，或是否是匹配路径的父路径
      if (matchedPaths.includes(normalizedPath) || 
          matchedPaths.some(p => normalizedPath.startsWith(p.replace(/[^/]+$/, '') + '/'))) {
        return true;
      }
    } 
    // 情况2：排除规则是普通路径（文件或文件夹）
    else {
      // 检查当前路径是否是排除文件、在排除文件夹下，或路径完全匹配
      if (normalizedPath === normalizedExcludePath || 
          normalizedPath.startsWith(normalizedExcludePath + '/')) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 工具函数：处理文件名为直接父文件夹同名的情况，仅移除末尾的文件名部分（保留父文件夹路径）
 * @param {string} filePath Markdown文件的绝对路径
 * @param {string} cleanRelativePath 处理后的文档相对路径（已移除.md后缀、统一分隔符、数字前缀）
 * @returns {string} 处理后的路径
 */
function removeSameNameFileNamePart(filePath, cleanRelativePath) {
  // 获取处理后的文件名（不含后缀，已移除数字前缀）
  const originalFileName = path.basename(filePath, '.md');
  const fileName = removeLeadingNumberPrefix(originalFileName);
  // 获取文件的直接父文件夹的名称（处理数字前缀）
  const parentFolderName = removeLeadingNumberPrefix(path.basename(path.dirname(filePath)));
  // 获取文件的直接父文件夹的相对路径（相对于DOCS_SRC_DIR，处理数字前缀）
  const parentFolderRelativePath = path.relative(DOCS_SRC_DIR, path.dirname(filePath))
    .replace(/\\/g, '/')
    .split('/')
    .map(part => removeLeadingNumberPrefix(part))
    .join('/');

  // 仅当文件名与直接父文件夹名相同时处理
  if (fileName === parentFolderName) {
    // 情况1：父文件夹是docs根目录（parentFolderRelativePath为空），则保留父文件夹名（即fileName）
    if (!parentFolderRelativePath) {
      return fileName;
    }
    // 情况2：父文件夹是子目录，返回父文件夹的相对路径（移除末尾的文件名）
    return parentFolderRelativePath;
  }

  // 不满足条件则返回原路径
  return cleanRelativePath;
}

/**
 * 获取文件的最后更新时间（通过 git log，若没有 git 则用文件修改时间）
 */
function getFileLastUpdatedTime(filePath) {
  try {
    // 执行 git log 获取最后提交时间
    const log = execSync(`git log -1 --format=%cd --date=iso "${filePath}"`, { encoding: 'utf8' });
    return new Date(log.trim());
  } catch (err) {
    // 没有 git 则用文件的修改时间
    const stats = fs.statSync(filePath);
    return stats.mtime;
  }
}

/**
 * 生成 Docs RSS
 */
async function generateDocsRSS() {
  try {
    // 1. 检查 Docs 目录是否存在
    if (!fs.existsSync(DOCS_SRC_DIR)) {
      throw new Error(`Docs 源目录不存在：${DOCS_SRC_DIR}`);
    }

    // 2. 确保 build/docs 目录存在
    await fs.ensureDir(path.dirname(OUTPUT_PATH));

    // 3. 遍历 Docs 目录下的所有 Markdown 文件（排除 node_modules、.git 等）
    const mdFiles = glob.sync(`${DOCS_SRC_DIR}/**/*.md`, {
      ignore: ['**/node_modules/**', '**/.git/**', '**/_*.md'], // 基础排除项
    });

    if (mdFiles.length === 0) {
      throw new Error('Docs 目录下未找到 Markdown 文档');
    }

    // 4. 初始化 RSS 实例（使用new URL处理路径，避免重复//）
    const siteUrl = new URL(SITE_CONFIG.baseUrl, SITE_CONFIG.url).href;
    const feedUrl = new URL('docs/rss.xml', siteUrl).href;
    
    const feed = new RSS({
      title: SITE_CONFIG.title,
      description: SITE_CONFIG.description,
      site_url: siteUrl, // 处理后的完整站点URL
      feed_url: feedUrl, // 处理后的RSS文件URL
      language: SITE_CONFIG.language,
      pubDate: new Date(),
    });

    // 用于记录已处理的路径，避免重复
    const processedPaths = new Set();
    // 5. 处理每个 Markdown 文件
    const docsData = [];
    for (const file of mdFiles) {
      // 第一步：过滤排除路径的文件（原始文件路径）
      if (isPathExcluded(file, SITE_CONFIG.excludePaths, __dirname)) {
        continue;
      }

      // 读取文件内容
      const content = fs.readFileSync(file, 'utf8');
      // 解析前端matter（--- 之间的内容）
      const { data: frontMatter } = matter(content);

      // 过滤：排除草稿、隐藏文档
      if (frontMatter.draft || frontMatter.hide) {
        continue;
      }

      // 获取原始文件名（不含后缀）
      const originalFileName = path.basename(file, '.md');
      // 处理文件名：移除开头的数字-前缀
      const processedFileName = removeLeadingNumberPrefix(originalFileName);
      // 获取文档标题（优先 frontMatter.title，其次处理后的文件名）
      const title = frontMatter.title || processedFileName;

      // 计算文档的相对路径（适配 Docusaurus 的路由规则）
      const relativePath = path.relative(DOCS_SRC_DIR, file);
      // 步骤1：替换路径分隔符为/，并移除.md后缀
      let cleanRelativePath = relativePath.replace(/\\/g, '/').replace(/\.md$/, '');
      // 步骤2：拆分路径片段，逐个移除数字-前缀，再拼接（处理路径中的数字前缀）
      cleanRelativePath = cleanRelativePath
        .split('/')
        .map(part => removeLeadingNumberPrefix(part))
        .join('/');
      // 步骤3：处理文件名与直接父文件夹同名的情况（仅移除文件名，保留父文件夹路径）
      cleanRelativePath = removeSameNameFileNamePart(file, cleanRelativePath);
      // 步骤4：移除末尾的index（最后执行，避免影响路径层级）
      cleanRelativePath = removeTrailingIndex(cleanRelativePath);

      // 第二步：过滤处理后的路径（包括根路径如docs）
      // 使用path.posix.join拼接路径，避免手动拼接的分隔符问题
      const processedRelativePath = path.posix.join('docs', cleanRelativePath).replace(/\/$/, '');
      if (isPathExcluded(processedRelativePath, SITE_CONFIG.excludePaths, DOCS_SRC_DIR) || processedPaths.has(processedRelativePath)) {
        continue;
      }
      // 记录已处理的路径，避免重复
      processedPaths.add(processedRelativePath);

      // 步骤5：拼接baseUrl和文档路径，形成完整的permalink（解决baseUrl缺失问题）
      // 注意：使用posix.join确保路径分隔符为/，且不会出现重复//
      const permalink = path.posix.join(SITE_CONFIG.baseUrl, processedRelativePath);
      // 步骤6：获取最后更新时间
      const lastUpdatedAt = getFileLastUpdatedTime(file);

      docsData.push({
        title,
        permalink,
        lastUpdatedAt,
        file,
      });
    }

    // 6. 按最后更新时间排序（最新的在前）
    const sortedDocs = docsData.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);

    // 7. 截取指定数量的文章（支持设置最大个数）
    const limitedDocs = sortedDocs.slice(0, SITE_CONFIG.maxItems);

    // 8. 添加 RSS 条目
    limitedDocs.forEach((doc) => {
      // 拼接完整 URL（使用new URL确保路径正确，自动处理重复//）
      const docUrl = new URL(doc.permalink, SITE_CONFIG.url).href;
      // 处理guid的路径分隔符，确保统一为/
      const guid = doc.permalink.replace(/\\/g, '/');

      feed.item({
        title: doc.title,
        url: docUrl, // link标签对应的值
        guid: guid, // guid标签对应的值（融入baseUrl，解决缺失问题）
        guid_isPermaLink: false, // 显式设置isPermaLink属性
        date: doc.lastUpdatedAt,
      });
    });

    // 9. 生成 RSS XML 并写入文件
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