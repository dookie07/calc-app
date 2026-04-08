import { calculate } from "./calculator.js";

const defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
};

export const handler = async (event) => {
  try {
    if (event?.requestContext?.http?.method === "OPTIONS" || event?.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify({ ok: true }),
      };
    }

    const body = typeof event?.body === "string" ? JSON.parse(event.body) : event?.body ?? event;
    const expression = body?.expression;
    const result = calculate(expression);

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify({ result }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: defaultHeaders,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Invalid request.",
      }),
    };
  }
};