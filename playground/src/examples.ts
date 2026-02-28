export interface Example {
  name: string;
  code: string;
}

export const EXAMPLES: readonly Example[] = [
  {
    name: "Hello World",
    code: `\`\`\`
// z-lang Hello World
greeting = "Hello, z-lang!";
version = 1;

fn greet(name: string): string {
  return "Hello, " + name + "!";
}

msg = greet("World");
\`\`\``,
  },
  {
    name: "变量与隐式声明",
    code: `\`\`\`
// 隐式声明：首次赋值即声明
x = 42;
PI = 3.14159;
name = "z-lang";
active = true;
empty = null;

// 复合类型
arr = [1, 2, 3, 4, 5];
config = {
  host: "localhost",
  port: 8080,
  debug: true
};

// 成员访问和索引
host = config.host;
first = arr[0];

// 再次赋值不是声明
x = 100;
\`\`\``,
  },
  {
    name: "函数",
    code: `\`\`\`
// 函数声明
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
double = fn(x: number): number => x * 2;
square = fn(x: number): number => x * x;

result = factorial(5);
doubled = double(21);
\`\`\``,
  },
  {
    name: "控制流",
    code: `\`\`\`
// if / else
score = 85;
grade = "F";

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
sum = 0;
i = 1;
while (i <= 100) {
  sum = sum + i;
  i = i + 1;
}

// for 循环 (init 也是隐式声明)
product = 1;
for (j = 1; j <= 10; j = j + 1) {
  product = product * j;
}
\`\`\``,
  },
  {
    name: "Scope 隔离",
    code: `\`\`\`
// Scope 1: 定义 x
x = 10;
y = 20;
result = x + y;
\`\`\`

\`\`\`
// Scope 2: 独立的 x，与 Scope 1 无关
x = "hello";
msg = x + " world";
\`\`\`

\`\`\`
// Scope 3: 又一个独立的 x
x = [1, 2, 3];
first = x[0];
\`\`\``,
  },
  {
    name: "Fibonacci",
    code: `\`\`\`
// 递归 Fibonacci
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
  a = 0;
  b = 1;
  for (i = 0; i < n; i = i + 1) {
    temp = b;
    b = a + b;
    a = temp;
  }
  return a;
}

result = fib(10);
resultIter = fibIter(10);
\`\`\``,
  },
  {
    name: "综合示例",
    code: `\`\`\`
// 综合示例: 展示所有语法特性
MAX = 100;

fn range(start: number, end: number): number[] {
  result = [];
  for (i = start; i < end; i = i + 1) {
    result = result;
  }
  return result;
}

numbers = [1, 2, 3, 4, 5];

person = {
  name: "Alice",
  age: 30,
  greet: fn(other: string): string => "Hi " + other + "!"
};

message = person.greet("Bob");

// 嵌套控制流
total = 0;
for (i = 0; i < 10; i = i + 1) {
  if (i % 2 == 0) {
    total += i;
  } else {
    total -= 1;
  }
}
\`\`\``,
  },
];
