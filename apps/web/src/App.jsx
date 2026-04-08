import { useState } from "react";

const BUTTON_ROWS = [
  ["Clear", "Backspace", "+/-", "%"],
  ["7", "8", "9", "÷"],
  ["4", "5", "6", "x"],
  ["1", "2", "3", "-"],
  ["0", ".", "=", "+"],
];

const OPERATOR_SET = new Set(["+", "-", "x", "÷", "%"]);

function apiBase() {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return "";
  }
  return raw.replace(/\/$/, "");
}

function isOperator(value) {
  return OPERATOR_SET.has(value);
}

function App() {
  const [expression, setExpression] = useState("");
  const [display, setDisplay] = useState("0");
  const [error, setError] = useState("");

  function syncDisplay(nextExpression) {
    setExpression(nextExpression);
    setDisplay(nextExpression.length > 0 ? nextExpression : "0");
  }

  function handleNumberOrDecimal(value) {
    if (value === ".") {
      const segments = expression.split(/[+\-x÷%]/);
      const currentSegment = segments[segments.length - 1];
      if (currentSegment.includes(".")) {
        return;
      }
      if (currentSegment.length === 0) {
        syncDisplay(`${expression}0.`);
        return;
      }
    }
    syncDisplay(`${expression}${value}`);
  }

  function handleOperator(operator) {
    if (expression.length === 0) {
      if (operator === "-") {
        syncDisplay("-");
      }
      return;
    }

    const lastChar = expression[expression.length - 1];
    if (isOperator(lastChar)) {
      syncDisplay(`${expression.slice(0, -1)}${operator}`);
      return;
    }

    syncDisplay(`${expression}${operator}`);
  }

  function handleToggleSign() {
    if (expression.length === 0) {
      syncDisplay("-");
      return;
    }

    const match = expression.match(/(-?\d*\.?\d+)$/);
    if (!match) {
      return;
    }

    const value = match[1];
    const start = expression.length - value.length;
    const toggled = value.startsWith("-") ? value.slice(1) : `-${value}`;
    syncDisplay(`${expression.slice(0, start)}${toggled}`);
  }

  function handleBackspace() {
    syncDisplay(expression.slice(0, -1));
  }

  async function handleEvaluate() {
    if (expression.length === 0 || isOperator(expression[expression.length - 1])) {
      return;
    }

    setError("");
    try {
      const base = apiBase();
      const url = `${base}/calculate`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expression }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to calculate expression.");
      }

      syncDisplay(payload.result);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Calculation failed.");
    }
  }

  function handleButtonClick(value) {
    if (value >= "0" && value <= "9") {
      handleNumberOrDecimal(value);
      return;
    }

    switch (value) {
      case ".":
        handleNumberOrDecimal(value);
        break;
      case "+":
      case "-":
      case "x":
      case "÷":
      case "%":
        handleOperator(value);
        break;
      case "Clear":
        setError("");
        syncDisplay("");
        break;
      case "Backspace":
        handleBackspace();
        break;
      case "+/-":
        handleToggleSign();
        break;
      case "=":
        handleEvaluate();
        break;
      default:
        break;
    }
  }

  return (
    <main className="page">
      <section className="calculator">
        <div className="display" aria-label="Calculator display">
          {display}
        </div>
        {error ? <div className="error">{error}</div> : null}
        <div className="keypad">
          {BUTTON_ROWS.flat().map((buttonValue) => (
            <button
              key={buttonValue}
              type="button"
              className={isOperator(buttonValue) || buttonValue === "=" ? "operator" : ""}
              onClick={() => handleButtonClick(buttonValue)}
            >
              {buttonValue}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
