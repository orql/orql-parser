import Token, {TokenType} from './Token';

class Lexer {
  private orql: string;
  private index: number;
  constructor(orql: string) {
    this.orql = orql;
    this.index = 0;
  }
  private currentChar(): string {
    return this.orql.charAt(this.index);
  }
  private nextChar(): string {
    return this.orql.charAt(this.index + 1);
  }
  private end(): boolean {
    return this.index >= this.orql.length;
  }
  private static isLetter(c: string) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
  }
  private static isDigit(c: string) {
    return c >= '0' && c <= '9';
  }
  private readString(open: string): Token {
    let tmp = '';
    while (! this.end()) {
      const current = this.currentChar();
      if (current == open) {
        this.index ++;
        break;
      }
      if (current == '\\' && this.nextChar() == open) {
        this.index += 2;
        tmp += open;
        continue;
      }
      tmp += current;
      this.index ++;
    }
    return new Token(TokenType.String, tmp);
  }
  private readName(start: string): Token {
    let tmp = start;
    while (! this.end()) {
      const current = this.currentChar();
      if (! Lexer.isLetter(current) && current != '_') break;
      this.index ++;
      tmp += current;
    }
    switch (tmp) {
      case 'order':
        return new Token(TokenType.Order, 'order');
      case 'true':
        return new Token(TokenType.True, 'true');
      case 'false':
        return new Token(TokenType.False, 'false');
      case 'like':
        return new Token(TokenType.Like, 'like');
      case 'null':
        return new Token(TokenType.Null, 'null');
      default:
        return new Token(TokenType.Name, tmp);
    }
  }
  private readNumber(start: string): Token {
    let tmp = start;
    let isFloat = false;
    while (!this.end()) {
      const current = this.currentChar();
      if (current == '.') {
        isFloat = true;
        tmp += current;
        this.index ++;
        continue;
      }
      if (!Lexer.isDigit(current)) break;
      this.index ++;
      tmp += current;
    }
    return new Token(isFloat ? TokenType.Float : TokenType.Int, tmp);
  }
  private readParam(): Token {
    let tmp = '';
    while (!this.end()) {
      const current = this.currentChar();
      if (!Lexer.isLetter(current) && !Lexer.isDigit(current) && current != '_') break;
      this.index ++;
      tmp += current;
    }
    return new Token(TokenType.Param, tmp);
  }
  nextToken(): Token {
    if (this.end()) return new Token(TokenType.EOF, 'EOF');
    const c = this.orql.charAt(this.index ++);
    switch (c) {
      case ' ':
        return this.nextToken();
      case '*':
        return new Token(TokenType.All, c);
      case '{':
        return new Token(TokenType.OpenCurly, c);
      case '}':
        return new Token(TokenType.CloseCurly, c);
      case '(':
        return new Token(TokenType.OpenParen, c);
      case ')':
        return new Token(TokenType.CloseParen, c);
      case '[':
        return new Token(TokenType.OpenBracket, c);
      case ']':
        return new Token(TokenType.CloseBracket, c);
      case ':':
        return new Token(TokenType.Colon, c);
      case ',':
        return new Token(TokenType.Comma, c);
      case '=':
        return new Token(TokenType.Eq, c);
      case '>':
        if (this.currentChar() == '=') {
          this.index ++;
          return new Token(TokenType.Ge, '>=');
        }
        return new Token(TokenType.Gt, c);
      case '<':
        if (this.currentChar() == '=') {
          this.index ++;
          return new Token(TokenType.Le, '<=');
        }
        return new Token(TokenType.Lt, c);
      case '!':
        if (this.currentChar() == '=') {
          this.index ++;
          return new Token(TokenType.Ne, '!=');
        }
        return new Token(TokenType.Not, '!');
      case '&':
        if (this.currentChar() == '&') {
          this.index ++;
          return new Token(TokenType.And, '&&');
        }
        throw new Error(`miss &`);
      case '|':
        if (this.currentChar() == '|') {
          this.index ++;
          return new Token(TokenType.Or, '||');
        }
        throw new Error(`miss |`);
      case '"':
      case "'":
        return this.readString(c);
      case '-':
        return new Token(TokenType.Hyphen, '-');
      case '$':
        return this.readParam();
    }
    if (Lexer.isLetter(c)) return this.readName(c);
    if (Lexer.isDigit(c)) return this.readNumber(c);
    throw new Error(`not support char: ${c}`);
  }
}

export default Lexer;