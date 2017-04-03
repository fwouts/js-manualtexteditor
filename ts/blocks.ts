export interface Block {
  getLength(): number;
}

export class TextBlock implements Block {
  private _text: string;

  constructor(text: string) {
    this._text = text;
  }

  getText() {
    return this._text;
  }

  getLength() {
    return this._text.length;
  }

  replace(text: string, atPosition: number, replaceExisting: boolean) {
    this._text = this._text.substr(0, atPosition) + text + this._text.substr(atPosition + (replaceExisting ? 1 : 0));
  }
}

export class SpecialBlock implements Block {
  private _color: string;

  constructor(optColor?: string) {
    this._color = optColor || '#FAA';
  }

  getLength() {
    return 1;
  }

  getColor() {
    return this._color;
  }
}
