import { Block, TextBlock, SpecialBlock } from './blocks';

export default class EditorContent {
  private _blocks: Array<Block>;

  constructor() {
    this._blocks = [];
  }

  addBlock(block: Block) {
    this._blocks.push(block);
  }

  getBlocks() {
    return this._blocks;
  }

  getTotalLength() {
    let length = 0;
    for (let block of this._blocks) {
      length += block.getLength();
    }
    return length;
  }

  replace(text: string, atPosition: number, replaceExisting: boolean) {
    let currentPosition = 0;
    let inserted = false;
    for (let i = 0; i < this._blocks.length; i++) {
      let block = this._blocks[i];
      let beforeBlockPosition = currentPosition;
      let afterBlockPosition = beforeBlockPosition + block.getLength();
      currentPosition =  afterBlockPosition;
      if (block instanceof TextBlock) {
        if (afterBlockPosition > atPosition || i == this._blocks.length - 1) {
          block.replace(text, atPosition - beforeBlockPosition, replaceExisting);
          inserted = true;
          break;
        }
      } else {
        if (afterBlockPosition > atPosition) {
          this._blocks.splice(i, replaceExisting ? 1 : 0, new TextBlock(text));
          inserted = true;
          break;
        }
      }
    }
    if (!inserted) {
      // Text was appended at the end.
      this._blocks.push(new TextBlock(text));
    }
    this._optimizeBlocks();
  }

  _optimizeBlocks() {
    for (let i = 0; i < this._blocks.length;) {
      if (this._blocks[i].getLength() == 0) {
        this._blocks.splice(i, 1);
      } else {
        i++;
      }
    }
    if (this._blocks.length == 0) {
      this._blocks.push(new TextBlock(''));
    }
  }
}
