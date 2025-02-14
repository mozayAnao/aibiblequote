"use client";

import { Button } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [quotation, setQuotation] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [ws, setWs] = useState<WebSocket>();


  const startStreaming = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    recorder.ondataavailable = (event) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ audioData: event.data }));
      }
    };

    recorder.start(1000); // Send audio data every 1 second
    setIsStreaming(true);
  };

  const stopStreaming = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsStreaming(false);
    }
  };
console.log(quotation);
  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8080");
    setWs(websocket);

    websocket.onopen = () => {
      console.log("WebSocket connection established");
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.quotation) {
        setQuotation(data.quotation);
      } else if (data.error) {
        console.error("Error:", data.error);
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="h-full w-full flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="h-full w-full flex flex-col justify-between items-center">
          <h1 className="header text-center">VerseCatch</h1>
          <div className="responseContainer">
            <h2 className="verseTitle mb-4">Romans 8:28</h2>
            <p className="verseText">
              And we know that in all things God works for the good of those who
              love him, who have been called according to his purpose.
            </p>
          </div>
          <div className="actionArea w-1/2 flex flex-col items-center ">
            <div className="caption flex flex-col gap-4 items-center">
              <Image
                src={isStreaming ? "/recording.png" : "/record.png"}
                width={60}
                height={60}
                alt="record"
              />
              <p className="text-center captionText">
                Transcribing and detecting Bible quotations in real time.
              </p>
            </div>
            <Button
              variant="contained"
              className="lowercase-button"
              style={{
                backgroundColor: isStreaming ? "#ffdcdb" : "#1a1a1a",
                borderRadius: 32,
                color: isStreaming ? "ff6259" : "",
              }}
              startIcon={
                <Image
                  src={isStreaming ? "/mic-off-fill.png" : "/mic-fill.png"}
                  width={24}
                  height={24}
                  alt="mic-fill"
                />
              }
              onClick={isStreaming ? stopStreaming : startStreaming}
            >
              {isStreaming ? "Stop Listening" : "Start Listening"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
