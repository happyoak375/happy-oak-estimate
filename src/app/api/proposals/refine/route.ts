import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { requireAuthenticatedRequest } from "@/lib/serverAuth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedRequest(req);
    if (auth.response) return auth.response;

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert Project Manager for "Happy Oak Painting & Carpentry", a high-end home improvement company.
      Your task is to take informal notes from a salesman in Spanish and convert them into a professional, technical, and persuasive project description in English for a formal client proposal.

      Guidelines:
      - Use professional industry terminology (e.g., instead of "pintar", use "apply premium coating" or "surface refinishing").
      - Fix any informalities or slang from the original message.
      - Ensure the tone is corporate and trustworthy.
      - Return the data in a structured JSON format.

      Input Spanish text: "${text}"

      Response format:
      {
        "original_summary_es": "Breve resumen en español de lo que se entendió",
        "professional_title_en": "A catchy and professional title for the service",
        "refined_description_en": "The full professional description in English",
        "estimated_category": "Painting, Carpentry, or Pressure Washing"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    return NextResponse.json(JSON.parse(responseText));

  } catch (error) {
    console.error("Error refining proposal:", error);
    return NextResponse.json({ error: "Failed to process proposal" }, { status: 500 });
  }
}
