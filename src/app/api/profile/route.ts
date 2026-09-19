import { NextResponse } from "next/server";
import { getMaxProfile } from "@/lib/profile";

export async function GET() {
  return NextResponse.json({ profile: getMaxProfile() });
}
