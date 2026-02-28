export interface Example {
  name: string;
  code: string;
}

export const EXAMPLES: readonly Example[] = [
  {
    name: "Hello World",
    code: `// z-lang Hello World
let greeting: string = "Hello, z-lang!";
let version: number = 1;

fn greet(name: string): string {
  return "Hello, " + name + "!";
}

let msg = greet("World");`,
  },
  {
    name: "变量与类型",
    code: `// 变量声明与类型注解
let x: number = 42;
const PI: number = 3.14159;
let name: string = "z-lang";
let active: boolean = true;
let empty = null;

// 复合类型
let arr = [1, 2, 3, 4, 5];
let config = {
  host: "localhost",
  port: 8080,
  debug: true
};

// 通过成员访问和索引
let host = config.host;
let first = arr[0];`,
  },
  {
    name: "函数",
    code: `// 函数声明
fn add(a: number, b: number): number {
  return a + b;
}

fn isEven(n: number): boolean {
  return n % 2 == 0;
}

// 递归函数
fn factorial(n: number): number {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

// 箭头函数
let double = fn(x: number): number => x * 2;
let square = fn(x: number): number => x * x;

let result = factorial(5);
let doubled = double(21);`,
  },
  {
    name: "控制流",
    code: `// if / else
let score: number = 85;
let grade: string = "F";

if (score >= 90) {
  grade = "A";
} else if (score >= 80) {
  grade = "B";
} else if (score >= 70) {
  grade = "C";
} else {
  grade = "F";
}

// while 循环
let sum: number = 0;
let i: number = 1;
while (i <= 100) {
  sum = sum + i;
  i = i + 1;
}

// for 循环
let product: number = 1;
for (let j = 1; j <= 10; j = j + 1) {
  product = product * j;
}`,
  },
  {
    name: "Fibonacci",
    code: `// 递归 Fibonacci
fn fib(n: number): number {
  if (n <= 0) {
    return 0;
  }
  if (n == 1) {
    return 1;
  }
  return fib(n - 1) + fib(n - 2);
}

// 迭代 Fibonacci
fn fibIter(n: number): number {
  let a: number = 0;
  let b: number = 1;
  for (let i = 0; i < n; i = i + 1) {
    let temp = b;
    b = a + b;
    a = temp;
  }
  return a;
}

let result = fib(10);
let resultIter = fibIter(10);`,
  },
  {
    name: "综合示例",
    code: `// 综合示例: 展示所有语法特性
const MAX: number = 100;

fn range(start: number, end: number): number[] {
  let result = [];
  for (let i = start; i < end; i = i + 1) {
    result = result;
  }
  return result;
}

fn map(arr: number[], transform: void): number[] {
  let result = [];
  for (let i = 0; i < 10; i = i + 1) {
    let val = arr[i];
    result = result;
  }
  return result;
}

let numbers = [1, 2, 3, 4, 5];
let doubled = map(numbers, fn(x: number): number => x * 2);

let person = {
  name: "Alice",
  age: 30,
  greet: fn(other: string): string => "Hi " + other + "!"
};

let message = person.greet("Bob");

// 嵌套控制流
let total: number = 0;
for (let i = 0; i < 10; i = i + 1) {
  if (i % 2 == 0) {
    total += i;
  } else {
    total -= 1;
  }
}`,
  },
];
