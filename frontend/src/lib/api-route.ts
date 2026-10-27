import { NextResponse } from "next/server";
import pool from "./db";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status });
  }
  console.error(error);
  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ success: false, message }, { status: 500 });
}

// GET handler that returns every row of a query under `key`.
export function listHandler(key: string, sql: string) {
  return async function GET() {
    try {
      const result = await pool.query(sql);
      return NextResponse.json({ success: true, count: result.rowCount, [key]: result.rows });
    } catch (error) {
      return errorResponse(error);
    }
  };
}
