export class TextBlock {
  constructor(text) {
    this._text = text;
  }

  getText() {
    return this._text;
  }

  getLength() {
    return this._text.length;
  }

  replace(text, atPosition, replaceExisting) {
    this._text = this._text.substr(0, atPosition) + text + this._text.substr(atPosition + (replaceExisting ? 1 : 0));
  }
}

export class SpecialBlock {
  constructor(optColor) {
    this._color = optColor || '#FAA';
  }

  getLength() {
    return 1;
  }

  getColor() {
    return this._color;
  }
}
