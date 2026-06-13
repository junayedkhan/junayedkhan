const fs = require("fs");
const path = require("path");

const cssCache = new Map();

const loadServerCss = (fileName) => {
  if (cssCache.has(fileName)) return cssCache.get(fileName);

  const cssPath = path.join(__dirname, "..", "assets", "css", fileName);
  const css = fs.readFileSync(cssPath, "utf8");
  cssCache.set(fileName, css);
  return css;
};

module.exports = {
  loadServerCss,
};
