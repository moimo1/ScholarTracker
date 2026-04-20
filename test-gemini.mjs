import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("AIzaSyAYW-LLFlcgiP_yRBhPjW-CugED5JGwEMk");

async function run() {
  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyAYW-LLFlcgiP_yRBhPjW-CugED5JGwEMk";
    const res = await fetch(url);
    const data = await res.json();
    console.log(data.models.map(m => m.name));
  } catch (error) {
    console.error("Error from API:", error);
  }
}

run();
