// Triggering a redeploy
import { NextRequest, NextResponse } from "next/server";

type GeminiInlineData = {
  mimeType: string;
  data: string; // base64
};

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please set it up in your environment variables." },
        { status: 500 }
      );
    }

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "imageBase64 and mimeType are required" }, { status: 400 });
    }

    const userPrompt =
      prompt ||
      "Restyle this portrait into an ETHMumbai-branded avatar: use BEST Red (#e2231a), Bus Black (#1c1c1c), ETH Blue (#3fa9f5), Bus Yellow (#ffd600), and add subtle BEST bus/Mumbai skyline cues while keeping facial likeness.";

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: userPrompt },
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
    };

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash/versions/001:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = await res.json();
    console.log("Gemini API Response:", JSON.stringify(data, null, 2));

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const inline = parts.find((p: any) => p.inlineData) as { inlineData?: GeminiInlineData } | undefined;

    if (!inline?.inlineData?.data || !inline.inlineData.mimeType) {
      // Log the finish reason if it exists
      const finishReason = data?.candidates?.[0]?.finishReason;
      if (finishReason) {
        console.error("Image generation failed with reason:", finishReason);
        if (finishReason === "SAFETY") {
          return NextResponse.json({ error: "Image generation blocked due to safety settings." }, { status: 400 });
        }
      }
      return NextResponse.json({ error: "No image returned from Gemini" }, { status: 502 });
    }

    return NextResponse.json({
      mimeType: inline.inlineData.mimeType,
      imageBase64: inline.inlineData.data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
