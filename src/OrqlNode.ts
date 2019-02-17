export class OrqlNode {
  readonly op: string;
  readonly item: OrqlItem;
  constructor(op: string, item: OrqlItem) {
    this.op = op;
    this.item = item;
  }
}

export class OrqlItem {
  readonly name: string;
  readonly children?: Array<OrqlItem>;
  readonly where?: OrqlWhere;
  readonly isArray: boolean;
  constructor(name: string, isArray?: boolean, children?: Array<OrqlItem>, where?: OrqlWhere) {
    this.name = name;
    this.children = children;
    this.where = where;
    this.isArray = isArray != undefined ? isArray : false;
  }
}

export class OrqlAllItem extends OrqlItem {
  constructor() {
    super('');
  }
}

export class OrqlIgnoreItem extends OrqlItem {
  constructor(name: string) {
    super(name);
  }
}

export class OrqlWhere {
  readonly exp?: OrqlExp;
  readonly orders?: Array<OrqlOrder>;
  constructor(exp?: OrqlExp, orders?: Array<OrqlOrder>) {
    this.exp = exp;
    this.orders = orders;
  }
}

export class OrqlExp {

}

export class OrqlNestExp extends OrqlExp {
  readonly exp: OrqlExp;
  constructor(exp: OrqlExp) {
    super();
    this.exp = exp;
  }
}

export class OrqlLogicExp extends OrqlExp {
  readonly left: OrqlExp;
  readonly op: OrqlLogicOp;
  readonly right: OrqlExp;
  constructor(left: OrqlExp, op: OrqlLogicOp, right: OrqlExp) {
    super();
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

export class OrqlNotExp {
  readonly exp: OrqlExp;
  constructor(exp: OrqlExp) {
    this.exp = exp;
  }
}

export class OrqlCompareExp extends OrqlExp {
  readonly left: OrqlColumn;
  readonly op: OrqlCompareOp;
  readonly right: OrqlValue | OrqlColumn | OrqlParam;
  constructor(left: OrqlColumn, op: OrqlCompareOp, right: OrqlValue | OrqlColumn | OrqlParam) {
    super();
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

export class OrqlColumn {
  readonly name: string;
  constructor(name: string) {
    this.name = name;
  }
}

export class OrqlParam {
  readonly name: string;
  constructor(name: string) {
    this.name = name;
  }
}

export class OrqlOrder {
  readonly columns: Array<OrqlColumn>;
  readonly sort: string;
  constructor(columns: Array<OrqlColumn>, sort: string) {
    this.columns = columns;
    this.sort = sort;
  }
}

export class OrqlValue {
  readonly value: any;
  constructor(value: any) {
    this.value = value;
  }
}

export class OrqlNull extends OrqlValue {

}

export enum OrqlLogicOp {
  And,
  Or
}

export enum OrqlCompareOp {
  Ge,
  Gt,
  Le,
  Lt,
  Eq,
  Ne,
  Like
}