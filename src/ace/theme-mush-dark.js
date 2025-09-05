ace.define("ace/theme/mush-dark",[
  "require",
  "exports",
  "module",
  "ace/lib/dom",
  "ace/theme/tomorrow_night_bright"
], function(require, exports, module) {
  const base = require("ace/theme/tomorrow_night_bright");
  exports.isDark = true;
  exports.cssClass = "ace-mush-dark";
  exports.cssText = base.cssText.replace(/ace-tomorrow-night-bright/g, "ace-mush-dark");
  const dom = require("ace/lib/dom");
  dom.importCssString(exports.cssText, exports.cssClass);
});

