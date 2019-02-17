enum TokenType {
  // name
  Name = 'name',
  // *
  All = '*',
  // :
  Colon = ':',
  // {
  OpenCurly = '{',
  // }
  CloseCurly = '}',
  // (
  OpenParen = '(',
  // )
  CloseParen = ')',
  // [
  OpenBracket = '[',
  // ]
  CloseBracket = ']',
  // >
  Ge = '>',
  // >=
  Gt = '>=',
  // <,
  Lt = '<',
  // <=
  Le = '<=',
  // ==
  Eq = '=',
  // !=
  Ne = '!=',
  // &&
  And = '&&',
  // ||
  Or = '||',
  // like
  Like = 'like',
  // $name
  Param = 'param',
  // true,
  True = 'true',
  // false
  False = 'false',
  Int = 'int',
  Float = 'float',
  // string
  String = 'string',
  // null
  Null = 'null',
  // ,
  Comma = ',',
  // order
  Order = 'order',
  // -
  Hyphen = '-',
  // !
  Not = '!',
  // end
  EOF = 'eof'
}

class Token {
  type: TokenType;
  string: string;
  constructor(type: TokenType, string: string) {
    this.type = type;
    this.string = string;
  }
}

export {TokenType};
export default Token;