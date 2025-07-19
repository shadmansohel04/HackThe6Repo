import readline from "readline";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function analyzeFood(foodName, ingredients) {
  const prompt = `
You're a food battle analyzer. Analyze the given food and return only in this JSON format:
{
  name: "", 
  details: "", 
  health: 0, 
  jump: 0, 
  speed: 0
}'
Boosts:
- health = how healthy the food is (0 to 50)
- jump = how delicious it looks/tastes (0 to 50)
- speed = how balanced it is in the 4 food groups (0 to 50)
Explain nutrition and food type briefly in 'details'.
Respond ONLY with JSON.

Food name: ${foodName}
Ingredients: ${ingredients}
`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = result.text
    console.log("AI Response:\n", text);
  } catch (error) {
    console.error("Error during generation:", error);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  const foodName = await askQuestion("Enter food name: ");
  const ingredients = await askQuestion("Enter ingredients (comma separated): ");
  rl.close();

  await analyzeFood(foodName, ingredients);
}

main();
