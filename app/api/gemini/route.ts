import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: NextRequest) {
  try {
    const { message, studentContext, adminName } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build comprehensive context for AI
    let fullContext = `You are an AI assistant for JDSA Students Bank admin dashboard. 
Current Admin: ${adminName || "Admin"}

System Information:
${studentContext ? `Student Database: ${studentContext}` : ""}

User Request: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullContext,
    });

    const text = response.text || "No response from AI";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
