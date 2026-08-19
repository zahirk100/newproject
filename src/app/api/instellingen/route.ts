import { NextRequest, NextResponse } from "next/server";
import { getInstellingen, saveInstellingen } from "@/lib/store";

export async function GET() {
  const instellingen = await getInstellingen();
  return NextResponse.json(instellingen);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const instellingen = await saveInstellingen(body);
  return NextResponse.json(instellingen);
}
