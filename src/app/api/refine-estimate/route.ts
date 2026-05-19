import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize the SDK. It automatically picks up GEMINI_API_KEY from your .env.local
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "WhatsApp text is required to generate an estimate." },
        { status: 400 }
      );
    }

    // The System Prompt: This is the brain of your Quick Import feature
    const systemInstruction = `
      You are an expert estimator for Happy Oak Painting, a premium residential painting and carpentry business.
      Your job is to translate informal Spanglish/Spanish WhatsApp messages from the salesman into a highly professional English JSON estimate.
      
      Translation & Formatting Rules:
      - Upgrade casual Spanish terms into high-end contracting phrasing.
      - Examples: 
        - "pintar paredes" -> "Apply premium paint two coats to walls."
        - "poner coking" -> "Apply premium caulking to baseboards, trim, and gaps."
        - "primear azak" -> "Apply premium exterior primer to raw wood and Azek/PVC trim."
        - "estenear pasamanos" -> "Stain and seal handrails and spindles."
      - DO NOT output any conversational text like "Here is the JSON" or "I have translated this". 
      
      Your output MUST be strictly valid JSON matching this exact structure:
      {
        "estimateName": "Brief, professional project title (e.g., Exterior Painting & Carpentry)",
        "clientName": "Client Name (if found in text, otherwise leave empty string)",
        "clientEmail": "Client Email (if found in text, otherwise leave empty string)",
        "street": "Property Address (if found in text, otherwise leave empty string)",
        "jobAreas": [
          {
            "areaName": "Name of the room/area in professional English (e.g., Master Bathroom, Deck Refinishing)",
            "tasks": "A clean string with professional tasks separated by \\n",
            "exceptions": "Any exclusions or exceptions mentioned (e.g., 'Structural repairs not included')",
            "price": "Extract the price as a number string without dollar signs (e.g., '1500')"
          }
        ]
      }
    `;

    // Call the fast Flash model and force it to return strict JSON
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
        }
    });

    // Parse the AI's pure JSON string into an actual JavaScript object
    const resultJson = JSON.parse(response.text || "{}");

    return NextResponse.json(resultJson, { status: 200 });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process the estimate text through the AI engine." },
      { status: 500 }
    );
  }
}