ace.define("ace/theme/mush-light",["require","exports","module","ace/lib/dom","ace/theme/chrome"],function(acequire,exports,module){
  var base = acequire("ace/theme/chrome");
  exports.isDark = false;
  exports.cssClass = "ace-mush-light";
  exports.cssText = base.cssText.replace(/ace-chrome/g, "ace-mush-light");
  var dom = acequire("ace/lib/dom");
  dom.importCssString(exports.cssText, exports.cssClass);
});
