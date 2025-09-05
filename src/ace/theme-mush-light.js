ace.define("ace/theme/mush-light",[
  "require",
  "exports",
  "module",
  "ace/lib/dom",
  "ace/theme/chrome"
], function(require, exports, module) {
  const base = require("ace/theme/chrome");
  exports.isDark = false;
  exports.cssClass = "ace-mush-light";
  exports.cssText = base.cssText.replace(/ace-chrome/g, "ace-mush-light");
  const dom = require("ace/lib/dom");
  dom.importCssString(exports.cssText, exports.cssClass);
});

