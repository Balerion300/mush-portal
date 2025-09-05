ace.define("ace/theme/mush-dark",["require","exports","module","ace/lib/dom","ace/theme/tomorrow_night_bright"],function(acequire,exports,module){
  var base = acequire("ace/theme/tomorrow_night_bright");
  exports.isDark = true;
  exports.cssClass = "ace-mush-dark";
  exports.cssText = base.cssText.replace(/ace-tomorrow-night-bright/g, "ace-mush-dark");
  var dom = acequire("ace/lib/dom");
  dom.importCssString(exports.cssText, exports.cssClass);
});
