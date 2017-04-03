/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var TextBlock = (function () {
    function TextBlock(text) {
        this._text = text;
    }
    TextBlock.prototype.getText = function () {
        return this._text;
    };
    TextBlock.prototype.getLength = function () {
        return this._text.length;
    };
    TextBlock.prototype.replace = function (text, atPosition, replaceExisting) {
        this._text = this._text.substr(0, atPosition) + text + this._text.substr(atPosition + (replaceExisting ? 1 : 0));
    };
    return TextBlock;
}());
exports.TextBlock = TextBlock;
var SpecialBlock = (function () {
    function SpecialBlock(optColor) {
        this._color = optColor || '#FAA';
    }
    SpecialBlock.prototype.getLength = function () {
        return 1;
    };
    SpecialBlock.prototype.getColor = function () {
        return this._color;
    };
    return SpecialBlock;
}());
exports.SpecialBlock = SpecialBlock;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var editorcontent_1 = __webpack_require__(2);
var blocks_1 = __webpack_require__(0);
var Editor = (function () {
    function Editor(document) {
        var _this = this;
        this._caretPosition = 0;
        this._domCaret = document.getElementById('caret');
        this._domEditor = document.getElementById('editor');
        this._editorContent = new editorcontent_1["default"]();
        this._domHiddenInput = document.getElementById('sneakyinput');
        this._mouseIsDown = false;
        this._domEditor.addEventListener('mousedown', function (e) {
            _this._mouseIsDown = true;
            _this._onClick(e);
        });
        this._domEditor.addEventListener('mouseup', function (e) {
            _this._mouseIsDown = false;
        });
        this._domEditor.addEventListener('mousemove', function (e) {
            _this._onClick(e);
        });
        // We intercept key down events for keyboard commands other than typing in
        // characters because the browser automatically calls onkeydown repeatedly on
        // long presses (e.g. keeping backspace held for several seconds to erase
        // several words).
        this._domHiddenInput.addEventListener('keydown', function (e) {
            console.log('Key down event:', e.keyCode);
            switch (e.keyCode) {
                case 8:
                    // Backspace
                    if (_this._caretPosition > 0) {
                        _this._caretPosition--;
                        _this._editorContent.replace('', _this._caretPosition, true);
                    }
                    break;
                case 46:
                    // Delete
                    if (_this._caretPosition < _this._editorContent.getTotalLength()) {
                        _this._editorContent.replace('', _this._caretPosition, true);
                    }
                    break;
                case 13:
                    // Enter
                    _this._insertText('\n');
                    break;
                case 37:
                    // Left
                    if (_this._caretPosition > 0) {
                        _this._caretPosition--;
                        _this._updateEditorText();
                    }
                    break;
                case 39:
                    // Right
                    if (_this._caretPosition < _this._editorContent.getTotalLength()) {
                        _this._caretPosition++;
                        _this._updateEditorText();
                    }
                    break;
                case 38:
                    // Up
                    break;
                case 40:
                    // Down
                    break;
            }
            _this._updateEditorText();
        });
        // Whenever the value of the hidden input changes, it means that some characters
        // have been typed and we should append them to the editor.
        this._domHiddenInput.addEventListener('input', function (e) {
            console.log('Hidden input changed:', _this._domHiddenInput.value);
            _this._insertText(_this._domHiddenInput.value);
            _this._domHiddenInput.value = '';
        });
        this._domHiddenInput.focus();
        document.addEventListener('mouseup', function (e) {
            _this._domHiddenInput.focus();
        });
        this._updateEditorText();
    }
    Editor.prototype._insertText = function (text) {
        this._editorContent.replace(text, this._caretPosition, false);
        this._caretPosition += text.length;
        this._updateEditorText();
    };
    Editor.prototype._updateEditorText = function () {
        this._domCaret.parentNode.removeChild(this._domCaret);
        this._domEditor.innerText = '';
        var currentPosition = 0;
        var insertedCaret = false;
        var blocks = this._editorContent.getBlocks();
        for (var blockIndex in blocks) {
            var block = blocks[blockIndex];
            var beforeBlockPosition = currentPosition;
            var afterBlockPosition = beforeBlockPosition + block.getLength();
            currentPosition = afterBlockPosition;
            if (block instanceof blocks_1.TextBlock) {
                if (!insertedCaret && afterBlockPosition > this._caretPosition) {
                    var nodeBeforeCaret = document.createElement('span');
                    nodeBeforeCaret.textContent = block.getText().substr(0, this._caretPosition - beforeBlockPosition);
                    nodeBeforeCaret.dataset.associatedBlockIndex = blockIndex;
                    var nodeAfterCaret = document.createElement('span');
                    nodeAfterCaret.textContent = block.getText().substr(this._caretPosition - beforeBlockPosition);
                    nodeAfterCaret.dataset.associatedBlockIndex = blockIndex;
                    this._domEditor.appendChild(nodeBeforeCaret);
                    this._domEditor.appendChild(this._domCaret);
                    this._domEditor.appendChild(nodeAfterCaret);
                    insertedCaret = true;
                }
                else {
                    var node = document.createElement('span');
                    node.textContent = block.getText();
                    node.dataset.associatedBlockIndex = blockIndex;
                    this._domEditor.appendChild(node);
                }
            }
            else if (block instanceof blocks_1.SpecialBlock) {
                if (!insertedCaret && afterBlockPosition > this._caretPosition) {
                    this._domEditor.appendChild(this._domCaret);
                    insertedCaret = true;
                }
                var specialBlockNode = document.createElement('div');
                specialBlockNode.dataset.associatedBlockIndex = blockIndex;
                specialBlockNode.className = 'special-block';
                specialBlockNode.style.backgroundColor = block.getColor();
                this._domEditor.appendChild(specialBlockNode);
            }
        }
        if (!insertedCaret) {
            this._domEditor.appendChild(this._domCaret);
        }
    };
    Editor.prototype._onClick = function (e) {
        if (!this._mouseIsDown) {
            return;
        }
        var shiftPositionBy = 0;
        for (var node = this._domEditor.firstChild; node; node = node.nextSibling) {
            if (node == this._domCaret) {
                continue;
            }
            if (!(node instanceof HTMLElement)) {
                continue;
            }
            var blockIndex = parseInt(node.dataset.associatedBlockIndex);
            var block = this._editorContent.getBlocks()[blockIndex];
            if (node == e.target) {
                if (node.nodeName == 'SPAN') {
                    var position = this._findTextPosition(e.target, e);
                    if (position != -1) {
                        this._caretPosition = position + shiftPositionBy;
                    }
                }
                else {
                    var boundingRect = node.getBoundingClientRect();
                    // Add either 0 or 1 depending on where we clicked.
                    this._caretPosition = shiftPositionBy + Math.round((e.pageX - boundingRect.left) / boundingRect.width);
                }
                this._updateEditorText();
                break;
            }
            else {
                if (block instanceof blocks_1.TextBlock) {
                    // Note: when we encounter several spans from the same block (e.g.
                    // because there is a caret in between) this will count length properly.
                    shiftPositionBy += node.textContent.length;
                }
                else {
                    // Other blocks are never cut in half.
                    shiftPositionBy += block.getLength();
                }
            }
        }
    };
    Editor.prototype._findTextPosition = function (span, e) {
        var textNode = span.firstChild;
        if (textNode.nodeType != 3 /* text node */) {
            return -1;
        }
        if (textNode.nextSibling != null) {
            throw 'Found a sibling when there shouldn\'t be one';
        }
        if (textNode.textContent.length <= 1) {
            var boundingRect = span.getBoundingClientRect();
            if (boundingRect.left <= e.pageX &&
                boundingRect.top <= e.pageY &&
                boundingRect.right >= e.pageX &&
                boundingRect.bottom >= e.pageY) {
                // Return either 0 or 1 depending on where we clicked.
                return Math.round((e.pageX - boundingRect.left) / boundingRect.width);
            }
            else {
                return -1;
            }
        }
        var splitPosition = Math.floor(textNode.textContent.length / 2);
        var secondTextNode = textNode.splitText(splitPosition);
        var firstTextNode = textNode;
        var firstSpan = document.createElement('span');
        firstSpan.textContent = firstTextNode.textContent;
        var secondSpan = document.createElement('span');
        secondSpan.textContent = secondTextNode.textContent;
        span.replaceChild(firstSpan, firstTextNode);
        span.replaceChild(secondSpan, secondTextNode);
        // Now we have the following DOM structure:
        // span
        //   firstSpan
        //   secondSpan
        // TODO: Optimise this, if the span is single line and the event doesn't touch
        // then there is no need to dig inside.
        var firstPosition = this._findTextPosition(firstSpan, e);
        if (firstPosition != -1) {
            return firstPosition;
        }
        var secondPosition = this._findTextPosition(secondSpan, e);
        if (secondPosition != -1) {
            return secondPosition + splitPosition;
        }
        return -1;
    };
    return Editor;
}());
exports["default"] = Editor;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var blocks_1 = __webpack_require__(0);
var EditorContent = (function () {
    function EditorContent() {
        this._blocks = [];
    }
    EditorContent.prototype.addBlock = function (block) {
        this._blocks.push(block);
    };
    EditorContent.prototype.getBlocks = function () {
        return this._blocks;
    };
    EditorContent.prototype.getTotalLength = function () {
        var length = 0;
        for (var _i = 0, _a = this._blocks; _i < _a.length; _i++) {
            var block = _a[_i];
            length += block.getLength();
        }
        return length;
    };
    EditorContent.prototype.replace = function (text, atPosition, replaceExisting) {
        var currentPosition = 0;
        var inserted = false;
        for (var i = 0; i < this._blocks.length; i++) {
            var block = this._blocks[i];
            var beforeBlockPosition = currentPosition;
            var afterBlockPosition = beforeBlockPosition + block.getLength();
            currentPosition = afterBlockPosition;
            if (block instanceof blocks_1.TextBlock) {
                if (afterBlockPosition > atPosition || i == this._blocks.length - 1) {
                    block.replace(text, atPosition - beforeBlockPosition, replaceExisting);
                    inserted = true;
                    break;
                }
            }
            else {
                if (afterBlockPosition > atPosition) {
                    this._blocks.splice(i, replaceExisting ? 1 : 0, new blocks_1.TextBlock(text));
                    inserted = true;
                    break;
                }
            }
        }
        if (!inserted) {
            // Text was appended at the end.
            this._blocks.push(new blocks_1.TextBlock(text));
        }
        this._optimizeBlocks();
    };
    EditorContent.prototype._optimizeBlocks = function () {
        for (var i = 0; i < this._blocks.length;) {
            if (this._blocks[i].getLength() == 0) {
                this._blocks.splice(i, 1);
            }
            else {
                i++;
            }
        }
        if (this._blocks.length == 0) {
            this._blocks.push(new blocks_1.TextBlock(''));
        }
    };
    return EditorContent;
}());
exports["default"] = EditorContent;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var editor_1 = __webpack_require__(1);
var editor = new editor_1["default"](window.document);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3);
__webpack_require__(0);
__webpack_require__(1);
module.exports = __webpack_require__(2);


/***/ })
/******/ ]);