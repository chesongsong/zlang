export interface Example {
  name: string;
  code: string;
}

export const EXAMPLES: readonly Example[] = [
  {
    name: "Hello World",
    code: `\`\`\`
greeting = "Hello, z-lang!"
version = 1

问候(名字) {
  return "Hello, " + 名字 + "!"
}

msg = 问候("World")
\`\`\``,
  },
  {
    name: "变量与隐式声明",
    code: `\`\`\`
x = 42
圆周率 = 3.14159
名字 = "z-lang"
active = true
empty = null

数组 = [1, 2, 3, 4, 5]
配置 = {
  host: "localhost",
  port: 8080,
  debug: true
}

host = 配置.host
first = 数组[0]

x = 100
\`\`\``,
  },
  {
    name: "函数",
    code: `\`\`\`
加法(a, b) {
  return a + b
}

是偶数(n) {
  return n % 2 == 0
}

阶乘(n) {
  if (n <= 1) {
    return 1
  }
  return n * 阶乘(n - 1)
}

倍增 = fn(x) => x * 2
平方 = fn(x) => x * x

result = 阶乘(5)
doubled = 倍增(21)
\`\`\``,
  },
  {
    name: "控制流",
    code: `\`\`\`
分数 = 85
等级 = "F"

if (分数 >= 90) {
  等级 = "A"
} else if (分数 >= 80) {
  等级 = "B"
} else if (分数 >= 70) {
  等级 = "C"
} else {
  等级 = "F"
}

总和 = 0
i = 1
while (i <= 100) {
  总和 = 总和 + i
  i = i + 1
}

乘积 = 1
for (j = 1; j <= 10; j = j + 1) {
  乘积 = 乘积 * j
}
\`\`\``,
  },
  {
    name: "Scope 隔离",
    code: `\`\`\`
x = 10
y = 20
result = x + y
\`\`\`

\`\`\`
x = "hello"
msg = x + " world"
\`\`\`

\`\`\`
x = [1, 2, 3]
first = x[0]
\`\`\``,
  },
  {
    name: "Fibonacci",
    code: `\`\`\`
fib(n) {
  if (n <= 0) {
    return 0
  }
  if (n == 1) {
    return 1
  }
  return fib(n - 1) + fib(n - 2)
}

fibIter(n) {
  a = 0
  b = 1
  for (i = 0; i < n; i = i + 1) {
    temp = b
    b = a + b
    a = temp
  }
  return a
}

result = fib(10)
resultIter = fibIter(10)
\`\`\``,
  },
  {
    name: "综合示例",
    code: `\`\`\`
MAX = 100

numbers = [1, 2, 3, 4, 5]

person = {
  name: "Alice",
  age: 30,
  greet: fn(other) => "Hi " + other + "!"
}

message = person.greet("Bob")

total = 0
for (i = 0; i < 10; i = i + 1) {
  if (i % 2 == 0) {
    total += i
  } else {
    total -= 1
  }
}
\`\`\``,
  },
  {
    name: "中文标识符",
    code: `\`\`\`
年龄 = 17
名字 = "小明"

加法(a, b) {
  return a + b
}

结果 = 加法(年龄, 3)

倍数 = fn(x) => x * 2
翻倍年龄 = 倍数(年龄)
\`\`\``,
  },
  {
    name: "箭头函数",
    code: `\`\`\`
加一 = fn(x) => x + 1
乘二 = fn(x) => x * 2

组合 = fn(f, g) => {
  return fn(x) => f(g(x))
}

加一乘二 = 组合(加一, 乘二)
结果 = 加一乘二(5)
\`\`\``,
  },
];
