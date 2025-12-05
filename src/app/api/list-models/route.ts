import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please set it up in your environment variables." },
        { status: 500 }
      );
    }

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey
    );

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
