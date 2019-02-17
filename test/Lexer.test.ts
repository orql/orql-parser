import Lexer from '../src/Lexer';
import Token, {TokenType} from '../src/Token';

function getTokens(reql: string) {
  const lexer = new Lexer(reql);
  const tokens: Token[] = [];
  while (true) {
    const token = lexer.nextToken();
    tokens.push(token);
    if (token.type == TokenType.EOF) break;
  }
  return tokens;
}

test('test op', () => {
  const ops = ['query', 'add', 'update', 'delete', 'count'];
  for (const op of ops) {
    const tokens = getTokens(`${op} user : {*}`);
    const token = tokens[0];
    expect(TokenType.Name).toBe(token.type);
    expect(token.string).toBe(op);
  }
});

test('test compare', () => {
  const compares = ['>', '>=', '<', '<=', '=', '!=', 'like'];
  const tokenTypes = [TokenType.Gt, TokenType.Ge, TokenType.Lt, TokenType.Le, TokenType.Eq, TokenType.Ne, TokenType.Like];
  for (let i = 0; i < compares.length; i ++) {
    const tokens = getTokens(compares[i]);
    expect(tokens[0].type).toBe(tokenTypes[i]);
  }
});

test('test logic', () => {
  const logics = ['&&', '||'];
  const tokenTypes = [TokenType.And, TokenType.Or];
  for (let i = 0; i < logics.length; i ++) {
    const tokens = getTokens(logics[i]);
    expect(tokens[0].type).toBe(tokenTypes[i]);
  }
});

test('test int', () => {
  const ints = ['0', '1', '10'];
  for (let i = 0; i < ints.length; i ++) {
    const token = getTokens(ints[i])[0];
    expect(token.type).toBe(TokenType.Int);
    expect(token.string).toBe(ints[i]);
  }
});

test('test float', () => {
  const floats = ['0.1', '1.0', '10.01'];
  for (let i = 0; i < floats.length; i ++) {
    const token = getTokens(floats[i])[0];
    expect(token.type).toBe(TokenType.Float);
    expect(token.string).toBe(floats[i]);
  }
});

test('test string', () => {
  const strings = [`""`, `''`, `"string"`, `'string'`, `"str\\\"ing"`, `'str\\'ing'`];
  const results = [``, ``, 'string', 'string', `str\"ing`, `str\'ing`];
  for (let i = 0; i < strings.length; i ++) {
    console.log(strings[i]);
    const token = getTokens(strings[i])[0];
    expect(token.type).toBe(TokenType.String);
    expect(token.string).toBe(results[i]);
  }
});

test('test param', () => {
  const tokens = getTokens('$param1');
  expect(tokens[0].type).toBe(TokenType.Param);
  expect(tokens[0].string).toBe('param1');
});

test('test bool', () => {
  const trueToken = getTokens('true')[0];
  const falseToken = getTokens('false')[0];
  expect(trueToken.type).toBe(TokenType.True);
  expect(falseToken.type).toBe(TokenType.False);
});

test('test root name', () => {
  const tokens = getTokens('query user : {*}');
  const token = tokens[1];
  expect(TokenType.Name).toBe(token.type);
  expect('user').toBe(token.string);
});

test('test colon', () => {
  const tokens = getTokens('query user : {*}');
  const token = tokens[2];
  expect(TokenType.Colon).toBe(token.type);
  expect(':').toBe(token.string);
});

test('test bracket and curly and paren', () => {
  const tokens = getTokens('query user() : [*, role: {*}]');
  const openBracketToken = tokens[5];
  const closeBracketToken = tokens[tokens.length - 2];
  const openParenToken = tokens[2];
  const closeParenToken = tokens[3];
  const openCurlyToken = tokens[tokens.length - 5];
  const closeCurlyToken = tokens[tokens.length - 3];
  expect(TokenType.OpenBracket).toBe(openBracketToken.type);
  expect('[').toBe(openBracketToken.string);
  expect(TokenType.CloseBracket).toBe(closeBracketToken.type);
  expect(']').toBe(closeBracketToken.string);
  expect(TokenType.OpenParen).toBe(openParenToken.type);
  expect('(').toBe(openParenToken.string);
  expect(TokenType.CloseParen).toBe(closeParenToken.type);
  expect(')').toBe(closeParenToken.string);
  expect(TokenType.OpenCurly).toBe(openCurlyToken.type);
  expect('{').toBe(openCurlyToken.string);
  expect(TokenType.CloseCurly).toBe(closeCurlyToken.type);
  expect('}').toBe(closeCurlyToken.string);
});