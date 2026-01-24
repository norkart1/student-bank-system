import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { response: "I'm sorry, but the Gemini AI assistant is currently unavailable because the API key is not configured. Please contact the administrator to set up the GEMINI_API_KEY." },
        { status: 200 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { message, studentContext, adminName } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const fullContext = `You are an AI assistant for JDSA Students Bank admin dashboard. 
Current Admin: ${adminName || "Admin"}

System Information:
${studentContext ? `Student Database: ${studentContext}` : ""}

User Request: ${message}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(fullContext);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
