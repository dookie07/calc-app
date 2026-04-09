import cors from "cors";
import express from "express";
import { calculate } from "./calculator.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/calculate", (request, response) => {
  const { expression } = request.body ?? {};

  try {
    const result = calculate(expression);
    response.json({ result });
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "Invalid expression.",
    });
  }
});

app.listen(port, () => {
  console.log(`Calculator backend listening on http://localhost:${port}`);
});
