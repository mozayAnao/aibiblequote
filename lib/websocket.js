const { WebSocketServer } = require("ws");
const axios = require("axios");
const dotenv = require("dotenv");
const knex = require("knex");

dotenv.config();

// Initialize Knex
const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

const WHISPER_API_URL = process.env.WHISPER_API_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Create a WebSocket server
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    try {
      const audioData = JSON.parse(message).audioData;

      // Step 1: Transcribe audio using OpenAI Whisper
      const transcription = await transcribeAudio(audioData);

      // Step 2: Detect Bible reference using Gemini Flash
      const reference = await detectBibleReference(transcription);

      // Step 3: Retrieve Bible quotation
      const quotation = await getBibleQuotation(reference);

      // Step 4: Send quotation back to the client
      ws.send(JSON.stringify({ quotation }));
    } catch (error) {
      console.error("Error processing audio:", error.response.data);
      ws.send(JSON.stringify({ error: "An error occurred while processing the audio." }));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Transcribe audio using OpenAI Whisper
async function transcribeAudio(audioData) {
  const response = await axios.post(
    WHISPER_API_URL,
    {
      file: audioData,
      model: "whisper-tiny",
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.text;
}

// Detect Bible reference using Gemini Flash
async function detectBibleReference(text, lastReference, currentVersion) {
  const response = await axios.post(
    `${GEMINI_API_URL}${GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [{
            text: `
              You are a Bible reference detection assistant. Your task is to:
              1. Detect explicit Bible references in the text (e.g., "John 3:16").
              2. Detect implicit references (e.g., "Next verse" or "Previous verse") based on the last referenced verse.
              3. Detect Bible version changes (e.g., "Give me the NIV") and update the version accordingly.

              The last referenced verse is: ${lastReference}.
              The current Bible version is: ${currentVersion}.

              Text: "${text}"

              Return the detected Bible reference and version in the following JSON format:
              {
                "book": "John",
                "chapter": 3,
                "verse": 16,
                "version": "NIV"
              }`
          }]
        }
      ]
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

// Retrieve Bible quotation from an API
async function getBibleQuotation(reference) {
  const {book, chapter, verse, version = "kjv"} = reference;

  // Query the database using Knex
  const result = await db("kjv")
    .select("reference")
    .where({ book, chapter, verse, version })
    .first();

  return { title: reference, text: result.text };
}