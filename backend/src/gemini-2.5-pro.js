import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

// Required to get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔑 Load Gemini API Key
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY not set.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// ✅ Resolve absolute path to your image
const imagePath = path.resolve(__dirname, "../images/vanillaICE.jpg");

// ✅ Check if file exists
if (!fs.existsSync(imagePath)) {
  console.error("❌ Image file not found at:", imagePath);
  process.exit(1);
}

async function analyzeFoodImage(imagePath) {
  const fileBuffer = fs.readFileSync(imagePath);
  const mimeType = "image/jpeg"; // Change to image/png if needed

  const imagePart = {
    inlineData: {
      data: fileBuffer.toString("base64"),
      mimeType,
    },
  };

  const prompt = `
You're a food battle analyzer. Analyze the food in the image and return only in this JSON format:
{
  name: "", 
  details: "", 
  health: 0, 
  jump: 0, 
  speed: 0
}
Boosts:
- health = how healthy the food is (0 to 50)
- jump = how delicious it looks/tastes (0 to 50)
- speed = how balanced it is in the 4 food groups (0 to 50)
Explain nutrition and food type briefly in 'details'.
Respond ONLY with JSON.
`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-pro", // 👈 This supports images
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            imagePart,
          ],
        },
      ],
    });

    // 🧪 Debug output
    console.dir(result, { depth: null });

    const candidate = result.candidates?.[0];

    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      console.error("❌ No valid text found in AI response.");
      return;
    }

    const text = candidate.content.parts[0].text;
    console.log("✅ AI Response:\n", text);


  } catch (error) {
    console.error("❌ Error during generation:", error);
  }
}

// ✅ Run the analysis
analyzeFoodImage(imagePath);
