import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  return NextResponse.json({ message: "Hello World from GET" });
}

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  return NextResponse.json({ message: "Hello World from POST" });
}

export const PUT = async (req: NextRequest): Promise<NextResponse> => {
  return NextResponse.json({ message: "Hello World from PUT" });
}

export const PATCH = async (req: NextRequest): Promise<NextResponse> => {
  return NextResponse.json({ message: "Hello World from PATCH" });
}

export const DELETE = async (req: NextRequest): Promise<NextResponse> => {
  return NextResponse.json({ message: "Hello World from DELETE" });
}

export const HEAD = async (req: NextRequest): Promise<NextResponse> => {
  return NextResponse.json({ message: "Hello World from HEAD" });
}

export const OPTIONS = async (req: NextRequest): Promise<NextResponse> => {
  return NextResponse.json({ message: "Hello World from OPTIONS" });
}

export const TRACE = async (req: NextRequest): Promise<NextResponse> => {
  return NextResponse.json({ message: "Hello World from TRACE" });
}

export const CONNECT = async (req: NextRequest): Promise<NextResponse> => {
  return NextResponse.json({ message: "Hello World from CONNECT" });
}

