import { create } from "domain";
import { ALPHA, ALPHA_NUMERIC, DOT, EOF, EOL, WHITESPACE } from "./constants";
import { Scanner } from "./scanner";

enum TOKEN_TYPE {
  UNKNOWN = "UNKNOWN",
  EOL = "EOL",
  EOF = "EOF",
  STRING_LITERAL = "STRING_LITERAL",
  RULE = "RULE",
  ALTERNATIVE_SYMBOL = "ALTERNATIVE_SYMBOL",
  TERMINAL_VALUE = "TERMINAL_VALUE",
  COMMENT = "COMMENT",
  EQUALS = "EQUALS",
}

class Token {
  type: TOKEN_TYPE;
  value: string;
  line: number;
  column: number;

  constructor(type: TOKEN_TYPE, value: string, line: number, column: number) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }
}

class Tokenizer {
  private scanner: Scanner = new Scanner();
  private prevToken = TOKEN_TYPE.UNKNOWN;

  constructor() {}

  setInput(input: string) {
    this.scanner.setInput(input);
  }

  createToken(
    type: TOKEN_TYPE,
    value: string,
    column: number = this.scanner.currentChar.column,
    line: number = this.scanner.currentChar.line
  ) {
    return new Token(type, value, line, column);
  }

  takeUntilNewLine() {
    return this.takeUntilMatches([EOF, EOL]);
  }

  testRules(char: string, rules: Array<any>) {
    return (
      rules.findIndex((rule) => {
        if (Array.isArray(rule)) {
          return (rule as Array<any>).indexOf(char) > -1;
        } else {
          return char === rule;
        }
      }) > -1
    );
  }
  takeUntilMatches(rules: Array<any>, moveForward = true) {
    let char = this.scanner.currentChar;
    if (moveForward) {
      char = this.scanner.nextChar();
    }
    let buffer = "";
    while (!this.testRules(char.value, rules)) {
      buffer += char.value;
      char = this.scanner.nextChar();
    }

    return buffer;
  }
  takeWhileMatches(rules: Array<any>, moveForward = true) {
    let char = this.scanner.currentChar;
    if (moveForward) {
      char = this.scanner.nextChar();
    }

    let buffer = "";
    while (this.testRules(char.value, rules)) {
      buffer += char.value;
      char = this.scanner.nextChar();
    }

    return buffer;
  }

  skipWhitespace() {
    this.takeWhileMatches([WHITESPACE], false);
  }

  isCommentChar() {
    return this.scanner.currentChar.value === ";";
  }

  isTerminalChar() {
    return this.scanner.currentChar.value === "%";
  }

  isLiteralStringChar() {
    return this.scanner.currentChar.value === '"';
  }

  isAlphaChar() {
    return ALPHA.indexOf(this.scanner.currentChar.value) > -1;
  }

  isRuleChar() {
    return this.scanner.currentChar.value === "<";
  }

  isAlternativeChar() {
    return this.scanner.currentChar.value === "/";
  }

  isEqualChar() {
    return this.scanner.currentChar.value === "=";
  }

  nextToken() {
    let char = this.scanner.nextChar();

    this.skipWhitespace();

    if (char.value == "EOL") {
      return this.createToken(TOKEN_TYPE.EOL, "");
    }

    if (this.isCommentChar()) {
      const value = this.takeUntilNewLine();
      return this.createToken(
        TOKEN_TYPE.COMMENT,
        value,
        this.scanner.currentChar.column - value.length - 1
      );
    }

    if (this.isTerminalChar()) {
      const value = this.takeWhileMatches([ALPHA_NUMERIC, DOT, "-"]);
      return this.createToken(
        TOKEN_TYPE.TERMINAL_VALUE,
        value,
        this.scanner.currentChar.column - value.length - 1
      );
    }

    if (this.isLiteralStringChar()) {
      const value = this.takeUntilMatches(['"', EOL, EOF]);
      return this.createToken(
        TOKEN_TYPE.STRING_LITERAL,
        value,
        this.scanner.currentChar.column - value.length - 1
      );
    }

    if (this.isAlphaChar()) {
      const value = this.takeWhileMatches([ALPHA], false);
      return this.createToken(
        TOKEN_TYPE.RULE,
        value,
        this.scanner.currentChar.column - value.length
      );
    }

    if (this.isRuleChar()) {
      const value = this.takeUntilMatches([">", EOF, EOL]);
      return this.createToken(
        TOKEN_TYPE.RULE,
        value,
        this.scanner.currentChar.column - value.length - 1
      );
    }

    if (this.isAlternativeChar()) {
      return this.createToken(
        TOKEN_TYPE.ALTERNATIVE_SYMBOL,
        "/",
        this.scanner.currentChar.column
      );
    }

    if (this.isEqualChar()) {
      return this.createToken(
        TOKEN_TYPE.EQUALS,
        "=",
        this.scanner.currentChar.column
      );
    }

    if (this.scanner.isEOF()) {
      return this.createToken(TOKEN_TYPE.EOF, "");
    }

    return this.createToken(TOKEN_TYPE.UNKNOWN, "");
    //   console.log(char);
  }
}

export { Tokenizer, TOKEN_TYPE };
