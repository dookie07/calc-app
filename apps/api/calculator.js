const OPERATOR_PRECEDENCE = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "%": 2,
};

function tokenize(expression) {
  const normalized = expression.replaceAll("x", "*").replaceAll("÷", "/");
  const tokens = [];
  let numberBuffer = "";

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const prevToken = tokens[tokens.length - 1];
    const isUnaryMinus =
      char === "-" &&
      numberBuffer.length === 0 &&
      (!prevToken || OPERATOR_PRECEDENCE[prevToken] !== undefined);

    if ((char >= "0" && char <= "9") || char === "." || isUnaryMinus) {
      numberBuffer += char;
      continue;
    }

    if (numberBuffer.length > 0) {
      const parsed = Number(numberBuffer);
      if (Number.isNaN(parsed)) {
        throw new Error("Invalid number in expression.");
      }
      tokens.push(numberBuffer);
      numberBuffer = "";
    }

    if (OPERATOR_PRECEDENCE[char] !== undefined) {
      tokens.push(char);
      continue;
    }

    if (char === " ") {
      continue;
    }

    throw new Error(`Unsupported token: ${char}`);
  }

  if (numberBuffer.length > 0) {
    const parsed = Number(numberBuffer);
    if (Number.isNaN(parsed)) {
      throw new Error("Invalid number in expression.");
    }
    tokens.push(numberBuffer);
  }

  return tokens;
}

function toReversePolishNotation(tokens) {
  const output = [];
  const operators = [];

  for (const token of tokens) {
    if (OPERATOR_PRECEDENCE[token] === undefined) {
      output.push(token);
      continue;
    }

    while (
      operators.length > 0 &&
      OPERATOR_PRECEDENCE[operators[operators.length - 1]] >= OPERATOR_PRECEDENCE[token]
    ) {
      output.push(operators.pop());
    }
    operators.push(token);
  }

  while (operators.length > 0) {
    output.push(operators.pop());
  }

  return output;
}

function evaluateReversePolishNotation(tokens) {
  const stack = [];

  for (const token of tokens) {
    if (OPERATOR_PRECEDENCE[token] === undefined) {
      stack.push(Number(token));
      continue;
    }

    const right = stack.pop();
    const left = stack.pop();

    if (left === undefined || right === undefined) {
      throw new Error("Malformed expression.");
    }

    switch (token) {
      case "+":
        stack.push(left + right);
        break;
      case "-":
        stack.push(left - right);
        break;
      case "*":
        stack.push(left * right);
        break;
      case "/":
        if (right === 0) {
          throw new Error("Cannot divide by zero.");
        }
        stack.push(left / right);
        break;
      case "%":
        if (right === 0) {
          throw new Error("Cannot divide by zero.");
        }
        stack.push(left % right);
        break;
      default:
        throw new Error("Unsupported operator.");
    }
  }

  if (stack.length !== 1) {
    throw new Error("Malformed expression.");
  }

  return stack[0];
}

export function calculate(expression) {
  if (typeof expression !== "string" || expression.trim().length === 0) {
    throw new Error("Expression must be a non-empty string.");
  }

  const tokens = tokenize(expression);
  const rpn = toReversePolishNotation(tokens);
  const result = evaluateReversePolishNotation(rpn);

  if (!Number.isFinite(result)) {
    throw new Error("Result is not finite.");
  }

  const rounded = Number(result.toFixed(12));
  return rounded.toString();
}
