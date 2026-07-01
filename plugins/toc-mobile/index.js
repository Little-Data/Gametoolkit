const path = require('path');

module.exports = function () {
  return {
    name: 'docusaurus-plugin-toc-mobile',
    getClientModules() {
      return [path.resolve(__dirname, './client')];
    },
  };
};