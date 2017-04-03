import EditorContent from './editorcontent';
import { TextBlock, SpecialBlock } from './blocks';

let caretPosition = 0;
let caret = document.getElementById('caret');
let editor = document.getElementById('editor');
let editorContent = new EditorContent();
let hiddenInput = document.getElementById('sneakyinput');

// We intercept key down events for keyboard commands other than typing in
// characters because the browser automatically calls onkeydown repeatedly on
// long presses (e.g. keeping backspace held for several seconds to erase
// several words).
hiddenInput.addEventListener('keydown', function(e) {
  console.log('Key down event:', e.keyCode);
  switch (e.keyCode) {
    case 8:
      // Backspace
      if (caretPosition > 0) {
        caretPosition--;
        editorContent.replace('', caretPosition, true);
      }
      break;
    case 46:
      // Delete
      if (caretPosition < editorContent.getTotalLength()) {
        editorContent.replace('', caretPosition, true);
      }
      break;
    case 13:
      // Enter
      insertText('\n');
      break;
    case 37:
      // Left
      if (caretPosition > 0) {
        caretPosition--;
        updateEditorText();
      }
      break;
    case 39:
      // Right
      if (caretPosition < editorContent.getTotalLength()) {
        caretPosition++;
        updateEditorText();
      }
      break;
    case 38:
      // Up
      break;
    case 40:
      // Down
      break;
  }
  updateEditorText();
});

// Whenever the value of the hidden input changes, it means that some characters
// have been typed and we should append them to the editor.
hiddenInput.addEventListener('input', function(e) {
  console.log('Hidden input changed:', this.value);
  insertText(this.value);
  this.value = '';
});

function insertText(text) {
  editorContent.replace(text, caretPosition, false);
  caretPosition += text.length;
  updateEditorText();
}

function updateEditorText() {
  caret.parentNode.removeChild(caret);
  editor.innerText = '';

  let currentPosition = 0;
  let insertedCaret = false;
  for (let block of editorContent.getBlocks()) {
    let beforeBlockPosition = currentPosition;
    let afterBlockPosition = beforeBlockPosition + block.getLength();
    currentPosition =  afterBlockPosition;
    if (block instanceof TextBlock) {
      if (!insertedCaret && afterBlockPosition > caretPosition) {
        let nodeBeforeCaret = document.createElement('span');
        nodeBeforeCaret.textContent = block.getText().substr(0, caretPosition - beforeBlockPosition);
        nodeBeforeCaret.associatedBlock = block;
        let nodeAfterCaret = document.createElement('span');
        nodeAfterCaret.textContent = block.getText().substr(caretPosition - beforeBlockPosition);
        nodeAfterCaret.associatedBlock = block;
        editor.appendChild(nodeBeforeCaret);
        editor.appendChild(caret);
        editor.appendChild(nodeAfterCaret);
        insertedCaret = true;
      } else {
        let node = document.createElement('span');
        node.textContent = block.getText();
        node.associatedBlock = block;
        editor.appendChild(node);
      }
    } else {
      if (!insertedCaret && afterBlockPosition > caretPosition) {
        editor.appendChild(caret);
        insertedCaret = true;
      }
      let specialBlockNode = document.createElement('div');
      specialBlockNode.associatedBlock = block;
      specialBlockNode.className = 'special-block';
      specialBlockNode.style = 'background-color: ' + block.getColor();
      editor.appendChild(specialBlockNode);
    }
  }
  if (!insertedCaret) {
    editor.appendChild(caret);
  }
}

let mouseIsDown = false;

editor.addEventListener('mousedown', function(e) {
  mouseIsDown = true;
  onClick(e);
});

editor.addEventListener('mouseup', function(e) {
  mouseIsDown = false;
});

editor.addEventListener('mousemove', function(e) {
  onClick(e);
});

function onClick(e) {
  if (!mouseIsDown) {
    return;
  }
  let shiftPositionBy = 0;
  for (let node = editor.firstChild; node; node = node.nextSibling) {
    if (node == caret) {
      continue;
    }
    let block = node.associatedBlock;
    if (node == e.target) {
      if (node.nodeName == 'SPAN') {
        let position = findTextPosition(e.target, e);
        if (position != -1) {
          caretPosition = position + shiftPositionBy;
        }
      } else {
        let boundingRect = node.getBoundingClientRect();
        // Add either 0 or 1 depending on where we clicked.
        caretPosition = shiftPositionBy + Math.round((e.pageX - boundingRect.left) / boundingRect.width);
      }
      updateEditorText();
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

function findTextPosition(span, e) {
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
  let secondTextNode = textNode.splitText(splitPosition);
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
  let firstPosition = findTextPosition(firstSpan, e);
  if (firstPosition != -1) {
    return firstPosition;
  }
  let secondPosition = findTextPosition(secondSpan, e);
  if (secondPosition != -1) {
    return secondPosition + splitPosition;
  }
  return -1;
}

hiddenInput.focus();
document.addEventListener('mouseup', function(e) {
  hiddenInput.focus();
});
updateEditorText();
