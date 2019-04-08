import Lexer from './Lexer';
import Token, {TokenType} from './Token';
import {
  OrqlAllItem,
  OrqlColumn,
  OrqlCompareExp,
  OrqlCompareOp,
  OrqlExp,
  OrqlIgnoreItem,
  OrqlItem,
  OrqlLogicExp,
  OrqlLogicOp,
  OrqlNestExp,
  OrqlNode,
  OrqlOrder,
  OrqlParam,
  OrqlValue,
  OrqlWhere
} from './OrqlNode';

export = class Parser {
  private lexer: Lexer;
  private token: Token;
  private static caches: {[orql: string]: OrqlNode} = {};
  private static expCaches: {[exp: string]: OrqlExp} = {};
  constructor(orql: string) {
    this.lexer = new Lexer(orql);
    this.token = this.lexer.nextToken();
  }
  static parse(orql: string) {
    if (this.caches[orql]) return this.caches[orql];
    const parser = new Parser(orql);
    const node = parser.visit();
    this.caches[orql] = node;
    return node;
  }
  static parseExp(exp: string): OrqlExp {
    if (this.expCaches[exp]) return this.expCaches[exp];
    const parser = new Parser(exp);
    const orqlExp = parser.visitExp();
    this.expCaches[exp] = exp;
    return orqlExp;
  }
  private matchToken(type: TokenType): string {
    if (this.token.type != type) throw new Error(`expect ${type} actual ${this.token.type}`);
    const string = this.token.string;
    this.walk();
    return string;
  }
  private matchString(string: string) {
    if (this.token.string != string) throw new Error('');
    this.walk();
  }
  private isToken(type: TokenType): boolean {
    return this.token.type == type;
  }
  private isString(string: String): boolean {
    return this.token.string == string;
  }
  private walk() {
    this.token = this.lexer.nextToken();
  }
  visit(): OrqlNode {
    return this.visitOrql();
  }
  private visitOrql(): OrqlNode {
    const op = this.matchToken(TokenType.Name)!;
    return {op, item: this.visitRoot()};
  }
  private visitRoot(): OrqlItem {
    const name = this.matchToken(TokenType.Name)!;
    let where: OrqlWhere | undefined;
    if (this.isToken(TokenType.OpenParen)) {
      // (
      this.walk();
      where = this.visitWhere();
      this.matchToken(TokenType.CloseParen);
    }
    if (this.isToken(TokenType.Colon)) {
      this.walk();
      if (this.isToken(TokenType.OpenCurly)) {
        // {
        this.walk();
        const items = this.visitItems();
        this.matchToken(TokenType.CloseCurly);
        return new OrqlItem(name, false, items, where);
      } else if (this.isToken(TokenType.OpenBracket)) {
        // }
        this.walk();
        const items = this.visitItems();
        this.matchToken(TokenType.CloseBracket);
        return new OrqlItem(name, true, items, where);
      }
      throw new Error(`miss object or array`);
    }
    this.matchToken(TokenType.EOF);
    return new OrqlItem(name, false, [], where);
  }
  private visitItems(): Array<OrqlItem> {
    const items: OrqlItem[] = [];
    while (true) {
      const item = this.visitItem();
      items.push(item);
      // ,
      if (! this.isToken(TokenType.Comma)) break;
      this.walk();
    }
    return items;
  }
  private visitItem(): OrqlItem {
    if (this.isToken(TokenType.All)) {
      this.walk();
      return new OrqlAllItem();
    }
    if (this.isToken(TokenType.Not)) {
      this.walk();
      const name = this.matchToken(TokenType.Name)!;
      return new OrqlIgnoreItem(name);
    }
    const name = this.matchToken(TokenType.Name)!;
    const where = this.visitWhere();
    let children: OrqlItem[] = [];
    let isArray = false;
    if (this.isToken(TokenType.Colon)) {
      // :
      this.walk();
      if (this.isToken(TokenType.OpenCurly)) {
        // {
        this.walk();
        children = this.visitItems();
        // }
        this.matchToken(TokenType.CloseCurly);
      }
      if (this.isToken(TokenType.OpenBracket)) {
        // [
        this.walk();
        children = this.visitItems();
        isArray = true;
        // ]
        this.matchToken(TokenType.CloseBracket);
      }
    }
    return new OrqlItem(name, isArray, children, where);
  }
  private visitWhere(): OrqlWhere {
    let exp: OrqlExp | undefined;
    let orders: Array<OrqlOrder> | undefined;
    if (this.isString('(') || this.isToken(TokenType.Name)) {
      // 表达式以(或column开头
      exp = this.visitExp();
    }
    if (this.isToken(TokenType.Order)) {
      this.walk();
      orders = this.visitOrders();
    }
    return new OrqlWhere(exp, orders);
  }
  private visitExp(): OrqlExp {
    let tmp = this.visitExpTerm();
    while (this.isToken(TokenType.Or)) {
      this.walk();
      const exp = this.visitExp();
      tmp = new OrqlLogicExp(tmp, OrqlLogicOp.Or, exp);
    }
    return tmp;
  }
  private visitExpTerm(): OrqlExp {
    let tmp = this.visitExpFactor();
    while (this.isToken(TokenType.And)) {
      this.walk();
      const term = this.visitExpTerm();
      tmp = new OrqlLogicExp(tmp, OrqlLogicOp.And, term);
    }
    return tmp;
  }
  private visitColumn(): OrqlColumn {
    const name = this.matchToken(TokenType.Name)!;
    return new OrqlColumn(name);
  }
  private visitCompareOp(): OrqlCompareOp {
    if (this.isToken(TokenType.Eq)) {
      this.walk();
      return OrqlCompareOp.Eq;
    } else if (this.isToken(TokenType.Gt)) {
      this.walk();
      return OrqlCompareOp.Gt;
    } else if (this.isToken(TokenType.Ge)) {
      this.walk();
      return OrqlCompareOp.Ge;
    } else if (this.isToken(TokenType.Lt)) {
      this.walk();
      return OrqlCompareOp.Lt;
    } else if (this.isToken(TokenType.Le)) {
      this.walk();
      return OrqlCompareOp.Le;
    } else if (this.isString('like')) {
      this.walk();
      return OrqlCompareOp.Like;
    } else if (this.isToken(TokenType.Ne)) {
      this.walk();
      return OrqlCompareOp.Ne;
    }
    throw new Error('expect compare op');
  }
  private visitExpFactor(): OrqlExp {
    if (this.isToken(TokenType.OpenParen)) {
      // (
      this.walk();
      const exp = this.visitExp();
      this.matchToken(TokenType.CloseParen);
      return new OrqlNestExp(exp);
    }
    const column = this.visitColumn();
    const op = this.visitCompareOp();
    const right = this.visitRight();
    return new OrqlCompareExp(column, op, right);
  }
  private visitRight(): OrqlParam | OrqlValue | OrqlColumn {
    if (this.isToken(TokenType.Name)) {
      return this.visitColumn();
    }
    if (this.isToken(TokenType.Param)) {
      const name = this.token.string!;
      this.walk();
      return new OrqlParam(name);
    }
    if (this.isToken(TokenType.Int)) {
      const string = this.token.string;
      this.walk();
      return new OrqlValue(parseInt(string));
    }
    if (this.isToken(TokenType.Float)) {
      const string = this.token.string!;
      this.walk();
      return new OrqlValue(parseFloat(string));
    }
    if (this.isToken(TokenType.String)) {
      const string = this.token.string!;
      this.walk();
      return new OrqlValue(string);
    }
    if (this.isToken(TokenType.True)) {
      this.walk();
      return new OrqlValue(true);
    }
    if (this.isToken(TokenType.False)) {
      this.walk();
      return new OrqlValue(false);
    }
    if (this.isToken(TokenType.Null)) {
      this.walk();
      return new OrqlValue(null);
    }
    throw new Error('');
  }
  private visitOrders(): Array<OrqlOrder> {
    const orders: Array<OrqlOrder> = [];
    while (true) {
      const order = this.visitOrder();
      orders.push(order);
      // ,
      if (! this.isToken(TokenType.Comma)) break;
      this.walk();
    }
    return orders;
  }
  private visitOrder(): OrqlOrder {
    const columns: Array<OrqlColumn> = [];
    let sort = 'asc';
    while (true) {
      if (this.isString('asc') || this.isString('desc')) {
        sort = this.token.string!;
        this.walk();
        break;
      }
      const name = this.matchToken(TokenType.Name)!;
      const column = new OrqlColumn(name);
      columns.push(column);
      if (! this.isToken(TokenType.Name)) break;
    }
    return new OrqlOrder(columns, sort);
  }
}