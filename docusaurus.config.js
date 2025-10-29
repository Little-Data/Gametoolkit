// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Gametoolkit',
  tagline: 'Gametoolkit',
  favicon: 'img/192.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://little-data.github.io/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'little-data', // Usually your GitHub org/user name.
  projectName: 'Gametoolkit', // Usually your repo name.
  trailingSlash: false,

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh'],
  },
  plugins: [
    'docusaurus-plugin-zooming'
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          showLastUpdateTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        pages: {
          showLastUpdateTime: true,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      announcementBar: {
        id: 'follow_me',
        content: '⭐️ 如果这个网站能帮助到你，欢迎关注！  <a target="_blank" rel="noopener noreferrer" href="https://github.com/little-Data">GitHub</a>  |  <a target="_blank" rel="noopener noreferrer" href="https://space.bilibili.com/357695126">Bilibili</a>',
        //backgroundColor: '#fafbfc',
        textColor: '#091E42',
        isCloseable: true,
      },
      // giscus 评论功能
      giscus: {
        repo: 'Little-Data/Gametoolkit',
        repoId: 'R_kgDOIuVoGA',
        category: 'General',
        categoryId: 'DIC_kwDOIuVoGM4CxOFj',
      },
      // Replace with your project's social card
      image: 'img/192.png',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      docs: {
        sidebar: {
          hideable: true,
        },
      },
      navbar: {
        hideOnScroll: true,
        title: 'Gametoolkit',
        logo: {
          alt: 'Gametoolkit Logo',
          src: 'img/192.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '文档',
          },
          {to: '/blog', label: '更新日志', position: 'left'},
          {
            href: 'https://github.com/Little-Data/Gametoolkit',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `${new Date().getFullYear()} <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer noopener">CC BY-NC-SA 署名—非商业性使用—相同方式共享</a> Built with Docusaurus<br/>所有文档及其它资源收集于互联网，无法准确知晓作者。如有问题可到Github提出issue`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;