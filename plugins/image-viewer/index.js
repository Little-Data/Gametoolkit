module.exports = function (context, options) {
  const themeConfig = context.siteConfig?.themeConfig?.imageViewer || {};

  const config = {
    scale: options.scale ?? themeConfig.scale ?? 1.8,
    enableWheelZoom: options.enableWheelZoom ?? themeConfig.enableWheelZoom ?? true,
    containerSelector: options.containerSelector ?? themeConfig.containerSelector ?? 'article',
    minScale: options.minScale ?? themeConfig.minScale ?? 0.5,
    maxScale: options.maxScale ?? themeConfig.maxScale ?? 5,
    wheelStep: options.wheelStep ?? themeConfig.wheelStep ?? 0.25,
  };

  function safeStringify(obj) {
    return JSON.stringify(obj, (key, value) => {
      if (value === Infinity) return 'Infinity';
      if (value === -Infinity) return '-Infinity';
      return value;
    }).replace(/"Infinity"/g, 'Infinity').replace(/"-Infinity"/g, '-Infinity');
  }

  return {
    name: 'docusaurus-plugin-image-viewer',

    getClientModules() {
      return [require.resolve('./client')];
    },

    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'script',
            innerHTML: `window.__IMAGE_VIEWER_CONFIG__ = ${safeStringify(config)};`,
          },
        ],
      };
    },
  };
};