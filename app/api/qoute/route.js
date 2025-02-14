
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");

const server = http.createServer(app);
const io = new Server(server);

// WebSocket connection
io.on("connection", (socket) => {
    console.log("Client connected");
  
    socket.on("audioStream", async (audioData) => {
      try {
        // Step 1: Transcribe audio using OpenAI Whisper
        const transcription = await transcribeAudio(audioData);
  
        // Step 2: Detect Bible reference using Gemini Flash
        const reference = await detectBibleReference(transcription);
  
        // Step 3: Retrieve Bible quotation
        const quotation = await getBibleQuotation(reference);
  
        // Step 4: Send quotation back to the frontend
        socket.emit("quotation", quotation);
      } catch (error) {
        console.error("Error processing audio:", error);
        socket.emit("error", "An error occurred while processing the audio.");
      }
    });
  
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });