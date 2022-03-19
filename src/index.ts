import Readline from "readline";
import Stream from "stream";
import { ALPHA, ALPHA_NUMERIC, DOT, EOF, EOL, WHITESPACE } from "./constants";
import { Scanner, ScannerCharacter } from "./scanner";
import { Tokenizer, TOKEN_TYPE } from "./tokenizer";

const BNF_RULES = `
LF = %x0A ;Hello World
CR = %x0D
DECIMAL = %d13.10
CRLF = CR LF
command = "command string"
<rule> = <CRLF> / DECIMAL
`;

const tokenizer = new Tokenizer();
tokenizer.setInput(BNF_RULES);

let token = tokenizer.nextToken();
console.time("tokenisation");
while (token != null && token.type != TOKEN_TYPE.EOF) {
  //   console.log(token);

  token = tokenizer.nextToken();
}
console.timeEnd("tokenisation");
