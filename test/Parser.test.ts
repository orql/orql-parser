import {
  OrqlAllItem,
  OrqlCompareExp,
  OrqlCompareOp, OrqlExp, OrqlIgnoreItem,
  OrqlLogicExp,
  OrqlLogicOp,
  OrqlNestExp,
  OrqlParam,
  OrqlValue
} from '../src/OrqlNode';
import Parser from '../src/Parser';

test('test op', () => {
  const ops = ['query', 'count', 'add', 'update', 'delete'];
  for (const op of ops) {
    const node = Parser.parse(`${op} user: [id, name]`);
    expect(node.op).toBe(op);
  }
});

test('test root', () => {
  const array = Parser.parse(`query user : [id, name]`);
  expect(array.item.name).toBe('user');
  expect(array.item.isArray).toBeTruthy();
  expect(array.item.children!.length).toBe(2);
  const object = Parser.parse(`query user : {id, name}`);
  expect(object.item.isArray).toBeFalsy();
});

test('test children', () => {
  const node = Parser.parse('query user : [*, !password]');
  const root = node.item;
  const [allItem, passwordItem] = root.children!;
  expect(allItem instanceof OrqlAllItem).toBeTruthy();
  expect(passwordItem instanceof OrqlIgnoreItem).toBeTruthy();
  expect(passwordItem.name).toBe('password');
});

test('test belongsTo', () => {
  const node = Parser.parse('query user : [id, name, role : {id, name}]');
  const roleItem = node.item.children![2];
  expect(roleItem.name).toBe('role');
  expect(roleItem.children!.length).toBe(2);
});

test('test exp eq param', () => {
  const exp = Parser.parse('query user(id = $id) : {*, !password}').item.where!.exp! as OrqlCompareExp;
  expect(exp.left.name).toBe('id');
  expect(exp.op).toBe(OrqlCompareOp.Eq);
  expect((exp.right as OrqlParam).name).toBe('id');
});

test('test exp eq value', () => {
  type LiteralAndValue = {literal: string, value: any};
  const values: LiteralAndValue[] = [
    {literal: 'true', value: true},
    {literal: 'false', value: false},
    {literal: '1', value: 1},
    {literal: 'null', value: null}];
  for (const lv of values) {
    const exp = Parser.parse(`query user(id = ${lv.literal}) : {*, !password}`).item.where!.exp! as OrqlCompareExp;
    expect((exp.right as OrqlValue).value).toBe(lv.value);
  }
});

test('test exp logic', () => {
  const andExp = Parser.parse('query user(id = 1 && name = 2) : {*, !password}').item.where!.exp! as OrqlLogicExp;
  expect(andExp.op).toBe(OrqlLogicOp.And);

  const andLeftExp = andExp.left as OrqlCompareExp;
  const andRightExp = andExp.right as OrqlCompareExp;

  expect(andLeftExp.left.name).toBe('id');
  expect(andLeftExp.op).toBe(OrqlCompareOp.Eq);
  expect((andLeftExp.right as OrqlValue).value).toBe(1);

  expect(andRightExp.left.name).toBe('name');
  expect(andRightExp.op).toBe(OrqlCompareOp.Eq);
  expect((andRightExp.right as OrqlValue).value).toBe(2);

  const orExp = Parser.parse('query user(id = 1 || name = 2) : {*, !password}').item.where!.exp! as OrqlLogicExp;
  expect(orExp.op).toBe(OrqlLogicOp.Or);
});

test('test exp logic priority', () => {
  const exp = Parser.parse('query user(id = 1 && name = 2 || id = 3 && name = 4) : {*, !password}').item.where!.exp! as OrqlLogicExp;
  expect(exp.op).toBe(OrqlLogicOp.Or);
  expect((exp.left as OrqlLogicExp).op).toBe(OrqlLogicOp.And);
  expect((exp.right as OrqlLogicExp).op).toBe(OrqlLogicOp.And);
});

test('test order', () => {
  const order = Parser.parse('query user(order id) : {*}').item.where!.orders![0];
  expect(order.columns[0].name).toBe('id');
  expect(order.sort).toBe('asc');
  const multi = Parser.parse('query user(order id name, name desc) : {*}').item.where!.orders!;
  expect(multi[0].columns.length).toBe(2);
  expect(multi[1].columns.length).toBe(1);
});

test('test cache', () => {
  const orql = 'query user : [*]';
  const node = Parser.parse(orql);
  expect(Parser.parse(orql)).toBe(node);
});

test('test nest exp', () => {
  const orql = 'query user((id = $id)): {*}';
  const node = Parser.parse(orql);
  expect(node.item.where!.exp instanceof OrqlNestExp).toBeTruthy();
});

test('test parse exp string', () => {
  const exp = 'id = $id';
  const node = Parser.parseExp(exp);
  console.log(node);
  expect(node instanceof OrqlExp).toBeTruthy();
});