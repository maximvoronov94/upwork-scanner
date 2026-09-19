import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      aiProvider: process.env.AI_PROVIDER ?? "anthropic",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Health check failed", err);
    return NextResponse.json(
      { status: "error", database: "disconnected" },
      { status: 503 }
    );
  }
}
