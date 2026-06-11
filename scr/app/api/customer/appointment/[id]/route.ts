/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  _context: { params: Promise<{ id: string }> }
) {

  return NextResponse.json("");
}

export async function POST(
  _req: NextRequest,
  _context: { params: Promise<{ id: string }> }
) {

  return NextResponse.json("");
}

export async function PUT(
  _req: NextRequest,
  _context: { params: Promise<{ id: string }> }
) {

  return NextResponse.json("");
}
