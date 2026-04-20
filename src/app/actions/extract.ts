'use server'

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function extractDocumentData(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  // Strictly lock down the API key consumption to verified Scholars only
  if (!session?.user?.id || session.user.role !== 'SCHOLAR') {
    throw new Error("Unauthorized extraction attempt");
  }

  const file = formData.get('file') as File;
  const docType = formData.get('docType') as string;
  
  if (!file) throw new Error("No file provided");
  
  // Hardened Payload Limits: Block massive text/malicious payloads from overloading RAM
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Payload too large: Exceeds 10MB limit");
  }
  
  if (!file.type.startsWith('image/')) {
    throw new Error("Invalid payload: Only image processing is supported");
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  let prompt = "";
  
  if (docType === "transcript") {
    prompt = `You are a highly accurate data extraction system.
    Examine this academic transcript image carefully.
    Extract all course names, units (credits), and final grades.
    Return EXACTLY a JSON array of objects and absolutely nothing else. Do not use markdown wrappers.
    Format:
    [
      { "course": "Biology 101", "units": "3", "grade": "A" }
    ]
    If the image is not a transcript or you cannot parse the data, return an empty array [].`;
  } else {
    prompt = `You are an OCR extraction system.
    Examine this image and perfectly transcribe all the legible text you see within it.
    Return EXACTLY a flat string containing just the text you extracted and absolutely nothing else.
    If there is no text, return an empty string.`;
  }

  const image = {
    inlineData: {
      data: base64,
      mimeType: file.type
    }
  };

  try {
    const result = await model.generateContent([prompt, image]);
    const response = await result.response;
    let text = response.text().trim();
    
    if (docType === "transcript") {
       text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
       return JSON.parse(text);
    }
    
    return text;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    return docType === "transcript" ? [] : "";
  }
}
