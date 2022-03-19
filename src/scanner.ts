import { EOF, EOL } from "./constants";

class ScannerCharacter {
  value: string;
  line: number;
  column: number;

  constructor(character: string, line: number, column: number) {
    this.value = character;
    this.line = line;
    this.column = column;
  }
}

class Scanner {
  private input: string;
  private lineIndex = 0;
  private columnIndex = 0;
  private characterIndex = 0;
  private lastCharacterIndex = 0;
  private endOfLineReached = false;

  currentChar: ScannerCharacter = null;

  constructor() {
    this.input = "";
    this.reset();
  }

  reset() {
    this.lineIndex = 0;
    this.columnIndex = 0;
    this.characterIndex = 0;
    this.lastCharacterIndex = this.input.length - 1;
    this.endOfLineReached = false;
    this.currentChar = null;
  }

  setInput(input: string) {
    this.input = input;
    this.reset();
  }

  isReady() {
    return this.input.length != 0;
  }

  isEOF() {
    return this.currentChar.value === EOF || this.currentChar === null;
  }

  prevChar() {
    this.characterIndex--;

    if (this.endOfLineReached) {
      this.endOfLineReached = false;
    }

    this.columnIndex--;
  }

  nextChar() {
    this.endOfLineReached = false;
    let returnedCharacter = null;

    if (this.characterIndex > this.lastCharacterIndex) {
      returnedCharacter = this.createCharacter(EOF);
    } else {
      var chr = this.input[this.characterIndex++];

      //Check for new line

      if (chr == "\n" || chr == "\r\n") {
        returnedCharacter = this.createCharacter(EOL);
        this.lineIndex++;
        this.columnIndex = 0;
        this.endOfLineReached = true;
      } else {
        returnedCharacter = this.createCharacter(chr);
        this.columnIndex++; //Increase column number
      }
    }

    return (this.currentChar = returnedCharacter);
  }

  private createCharacter(chr: string) {
    return new ScannerCharacter(chr, this.lineIndex + 1, this.columnIndex + 1);
  }
}

export { Scanner, ScannerCharacter };
