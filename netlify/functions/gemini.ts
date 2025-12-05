import type { Handler } from "@netlify/functions";

// Multimodal Gemini endpoint; default to gemini-3-pro-image-preview, allow override via env
const MODEL = process.env.GEMINI_MODEL || "gemini-3-pro-image-preview";

export const handler: Handler = async (event) => {
  try {
    // Support GET to list available models (debugging)
    if (event.httpMethod === "GET") {
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
      );
      const list = await listRes.json();
      return {
        statusCode: listRes.status,
        body: JSON.stringify(list, null, 2),
      };
    }

    if (!process.env.GEMINI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    const { imageBase64, mimeType, prompt } = JSON.parse(event.body);

    if (!imageBase64 || !mimeType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "imageBase64 and mimeType are required" }),
      };
    }

    const userPrompt =
      prompt ||
      "Restyle this portrait into an ETHMumbai-branded avatar: BEST Red (#e2231a), Bus Black (#1c1c1c), ETH Blue (#3fa9f5), Bus Yellow (#ffd600), Bus Green (#00a859). Add subtle BEST bus or Mumbai skyline cues. Keep likeness. Bright, friendly finish.";

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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: text }),
      };
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const inline = parts.find((p: any) => p.inlineData) as
      | { inlineData?: { mimeType: string; data: string } }
      | undefined;

    if (!inline?.inlineData?.data || !inline.inlineData.mimeType) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "No image returned from Gemini" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        mimeType: inline.inlineData.mimeType,
        imageBase64: inline.inlineData.data,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error?.message || "Unknown error" }),
    };
  }
};
