import EditorContent from './editorcontent';
import { TextBlock, SpecialBlock } from './blocks';

export default class Editor {
  private _caretPosition: number;
  private _domCaret: HTMLElement;
  private _domEditor: HTMLElement;
  private _domHiddenInput: HTMLInputElement;
  private _editorContent: EditorContent;
  private _mouseIsDown: boolean;

  constructor(document: HTMLDocument) {
    this._caretPosition = 0;
    this._domCaret = document.getElementById('caret');
    this._domEditor = document.getElementById('editor');
    this._editorContent = new EditorContent();
    this._domHiddenInput = document.getElementById('sneakyinput') as HTMLInputElement;
    this._mouseIsDown = false;

    this._domEditor.addEventListener('mousedown', (e) => {
      this._mouseIsDown = true;
      this._onClick(e);
    });

    this._domEditor.addEventListener('mouseup', (e) => {
      this._mouseIsDown = false;
    });

    this._domEditor.addEventListener('mousemove', (e) => {
      this._onClick(e);
    });

    // We intercept key down events for keyboard commands other than typing in
    // characters because the browser automatically calls onkeydown repeatedly on
    // long presses (e.g. keeping backspace held for several seconds to erase
    // several words).
    this._domHiddenInput.addEventListener('keydown', (e) => {
      console.log('Key down event:', e.keyCode);
      switch (e.keyCode) {
        case 8:
          // Backspace
          if (this._caretPosition > 0) {
            this._caretPosition--;
            this._editorContent.replace('', this._caretPosition, true);
          }
          break;
        case 46:
          // Delete
          if (this._caretPosition < this._editorContent.getTotalLength()) {
            this._editorContent.replace('', this._caretPosition, true);
          }
          break;
        case 13:
          // Enter
          this._insertText('\n');
          break;
        case 37:
          // Left
          if (this._caretPosition > 0) {
            this._caretPosition--;
            this._updateEditorText();
          }
          break;
        case 39:
          // Right
          if (this._caretPosition < this._editorContent.getTotalLength()) {
            this._caretPosition++;
            this._updateEditorText();
          }
          break;
        case 38:
          // Up
          break;
        case 40:
          // Down
          break;
      }
      this._updateEditorText();
    });

    // Whenever the value of the hidden input changes, it means that some characters
    // have been typed and we should append them to the editor.
    this._domHiddenInput.addEventListener('input', (e) => {
      console.log('Hidden input changed:', this._domHiddenInput.value);
      this._insertText(this._domHiddenInput.value);
      this._domHiddenInput.value = '';
    });

    this._domHiddenInput.focus();
    document.addEventListener('mouseup', (e) => {
      this._domHiddenInput.focus();
    });
    this._updateEditorText();
  }

  _insertText(text: string): void {
    this._editorContent.replace(text, this._caretPosition, false);
    this._caretPosition += text.length;
    this._updateEditorText();
  }

  _updateEditorText() {
    this._domCaret.parentNode.removeChild(this._domCaret);
    this._domEditor.innerText = '';

    let currentPosition = 0;
    let insertedCaret = false;
    let blocks = this._editorContent.getBlocks();
    for (let blockIndex in blocks) {
      let block = blocks[blockIndex];
      let beforeBlockPosition = currentPosition;
      let afterBlockPosition = beforeBlockPosition + block.getLength();
      currentPosition =  afterBlockPosition;
      if (block instanceof TextBlock) {
        if (!insertedCaret && afterBlockPosition > this._caretPosition) {
          let nodeBeforeCaret = document.createElement('span');
          nodeBeforeCaret.textContent = block.getText().substr(0, this._caretPosition - beforeBlockPosition);
          nodeBeforeCaret.dataset.associatedBlockIndex = blockIndex;
          let nodeAfterCaret = document.createElement('span');
          nodeAfterCaret.textContent = block.getText().substr(this._caretPosition - beforeBlockPosition);
          nodeAfterCaret.dataset.associatedBlockIndex = blockIndex;
          this._domEditor.appendChild(nodeBeforeCaret);
          this._domEditor.appendChild(this._domCaret);
          this._domEditor.appendChild(nodeAfterCaret);
          insertedCaret = true;
        } else {
          let node = document.createElement('span');
          node.textContent = block.getText();
          node.dataset.associatedBlockIndex = blockIndex;
          this._domEditor.appendChild(node);
        }
      } else if (block instanceof SpecialBlock) {
        if (!insertedCaret && afterBlockPosition > this._caretPosition) {
          this._domEditor.appendChild(this._domCaret);
          insertedCaret = true;
        }
        let specialBlockNode = document.createElement('div');
        specialBlockNode.dataset.associatedBlockIndex = blockIndex;
        specialBlockNode.className = 'special-block';
        specialBlockNode.style.backgroundColor = block.getColor();
        this._domEditor.appendChild(specialBlockNode);
      }
    }
    if (!insertedCaret) {
      this._domEditor.appendChild(this._domCaret);
    }
  }

  _onClick(e: MouseEvent): void {
    if (!this._mouseIsDown) {
      return;
    }
    let shiftPositionBy = 0;
    for (let node = this._domEditor.firstChild; node; node = node.nextSibling) {
      if (node == this._domCaret) {
        continue;
      }
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      let blockIndex = parseInt(node.dataset.associatedBlockIndex);
      let block = this._editorContent.getBlocks()[blockIndex];
      if (node == e.target) {
        if (node.nodeName == 'SPAN') {
          let position = this._findTextPosition(e.target as HTMLSpanElement, e);
          if (position != -1) {
            this._caretPosition = position + shiftPositionBy;
          }
        } else {
          let boundingRect = node.getBoundingClientRect();
          // Add either 0 or 1 depending on where we clicked.
          this._caretPosition = shiftPositionBy + Math.round((e.pageX - boundingRect.left) / boundingRect.width);
        }
        this._updateEditorText();
        break;
      } else {
        if (block instanceof TextBlock) {
          // Note: when we encounter several spans from the same block (e.g.
          // because there is a caret in between) this will count length properly.
          shiftPositionBy += node.textContent.length;
        } else {
          // Other blocks are never cut in half.
          shiftPositionBy += block.getLength();
        }
      }
    }
  }

  _findTextPosition(span: HTMLSpanElement, e: MouseEvent): number {
    let textNode = span.firstChild;
    if (textNode.nodeType != 3 /* text node */) {
      return -1;
    }
    if (textNode.nextSibling != null) {
      throw 'Found a sibling when there shouldn\'t be one';
    }
    if (textNode.textContent.length <= 1) {
      let boundingRect = span.getBoundingClientRect();
      if (boundingRect.left <= e.pageX &&
          boundingRect.top <= e.pageY &&
          boundingRect.right >= e.pageX &&
          boundingRect.bottom >= e.pageY) {
        // Return either 0 or 1 depending on where we clicked.
        return Math.round((e.pageX - boundingRect.left) / boundingRect.width);
      } else {
        return -1;
      }
    }
    let splitPosition = Math.floor(textNode.textContent.length / 2);
    let secondTextNode = (textNode as any).splitText(splitPosition);
    let firstTextNode = textNode;
    let firstSpan = document.createElement('span');
    firstSpan.textContent = firstTextNode.textContent;
    let secondSpan = document.createElement('span');
    secondSpan.textContent = secondTextNode.textContent;
    span.replaceChild(firstSpan, firstTextNode);
    span.replaceChild(secondSpan, secondTextNode);
    // Now we have the following DOM structure:
    // span
    //   firstSpan
    //   secondSpan
    // TODO: Optimise this, if the span is single line and the event doesn't touch
    // then there is no need to dig inside.
    let firstPosition = this._findTextPosition(firstSpan, e);
    if (firstPosition != -1) {
      return firstPosition;
    }
    let secondPosition = this._findTextPosition(secondSpan, e);
    if (secondPosition != -1) {
      return secondPosition + splitPosition;
    }
    return -1;
  }
}
