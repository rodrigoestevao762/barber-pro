import { NextResponse } from "next/server";
import { BARBERS } from "@/lib/barbers";

export async function GET() {
  return NextResponse.json(BARBERS);
}

