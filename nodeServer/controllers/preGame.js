import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AWS from "aws-sdk"
import { GoogleGenAI } from "@google/genai";
import RECIPE from "../db/models/item.js"

const apiKey = process.env.GEMINI_API_KEY;

const S3 = new AWS.S3({
    accessKeyId: process.env.ACCESSKEY,
    secretAccessKey: process.env.SECRETACCESS,
    region: process.env.REGION,
});

const ai = new GoogleGenAI({ apiKey });

const normalize = (obj) => {
  obj.health = Math.floor(obj.health / 50 * 5);
  obj.jump = Math.floor(obj.jump / 50 * 3);
  obj.speed = Math.floor(obj.speed / 50 * 4);

  return obj;
}


async function analyzeFood(foodName) {
  const prompt = `
You're a food battle analyzer. Analyze the given food and return only in this JSON format:
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

Food name: ${foodName}
`;

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
            role: "user",
            parts: [{ text: prompt }],
            },
        ],
        // config:{
        //     maxOutputTokens: 300,
        //     frequencyPenalty: 1
        // }
    });
    return(result.text)    
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif/;
        const isValidExt = allowed.test(path.extname(file.originalname).toLowerCase());
        const isValidMime = allowed.test(file.mimetype);
        if (isValidExt && isValidMime) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
}).single('foodImage');

const createFood = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        try {
            const id = req.user.sub
            if(!id){
                throw new Error("invalid person")
            }
            const file = req.file;
            const { jsonData } = req.body;

            if (!file) {
                return res.status(400).json({ success: false, message: "Image file (foodImage) is required." });
            }

            if (!jsonData ) {
                return res.status(400).json({ success: false, message: "Missing jsonData" });
            }

            let parsedJSON;
            try {
                parsedJSON = await JSON.parse(jsonData);
            } catch (jsonErr) {
                return res.status(400).json({ success: false, message: "Invalid JSON in jsonData." });
            }
            if(!parsedJSON || !parsedJSON.foodName){
                throw new Error("unable to parse")
            }

            let fromGeminiJSON
            try {
                const result = await analyzeFood(parsedJSON.foodName)
                let objString = result.split("{").length > 1? result.split("{")[1]: null
                objString = objString.split("}")[0]
                const final = `{${objString}}`
                fromGeminiJSON = await JSON.parse(final)
            } catch (error) {
                fromGeminiJSON = {name: parsedJSON.foodName, details: "", health: 0, jump: 0, speed: 0}
            }

            fromGeminiJSON = normalize(fromGeminiJSON)
            // console.log("Normalized values:", fromGeminiJSON);

            const fileStream = fs.createReadStream(file.path);
            
            const uniqueKey = `uploads/${Date.now()}-${Math.random().toString(36).substring(2)}${path.extname(file.originalname)}`;

            const params = {
                Bucket: process.env.BUCKETNAME,
                Key: uniqueKey,
                Body: fileStream,
                ContentType: file.mimetype,
            };


            await S3.putObject(params).promise()
            fs.unlinkSync(file.path);

            const url = `https://foodimgbuck.s3.us-east-2.amazonaws.com/${uniqueKey}`

            await RECIPE.create({
                foodName: fromGeminiJSON.name,
                foodURL: url,
                personID: id,
                description: fromGeminiJSON.details,
                health: fromGeminiJSON.health,
                jump: fromGeminiJSON.jump,
                speed: fromGeminiJSON.speed,
            })

            return res.status(200).json({
                success: true,
                message: 'Food uploaded successfully',
                imageURL: url,
                details: fromGeminiJSON
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Server Error", error: error.message });
        }
    });
};

export { createFood };
