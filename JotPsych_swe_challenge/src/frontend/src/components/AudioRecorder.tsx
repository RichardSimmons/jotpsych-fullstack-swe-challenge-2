import React, { useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";

interface AudioRecorderProps {
  onTranscriptionUpload: (newTranscript: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscriptionUpload }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordTime, setRecordTime] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawVisualization = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyserRef.current?.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.stroke();

      requestAnimationFrame(draw);
    };

    draw();
  };

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });
        chunksRef.current = [];

        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        source.connect(analyserRef.current);

        drawVisualization();

        mediaRecorderRef.current.ondataavailable = (e) => {
          chunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          setAudioBlob(blob);
        };

        mediaRecorderRef.current.start();
        setRecording(true);

        // Start the timer
        timerRef.current = window.setInterval(() => {
          setRecordTime((prevTime) => prevTime + 1);
        }, 1000);

        // Auto stop after 15 seconds
        window.setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            setRecording(false);
            clearInterval(timerRef.current!);
            setRecordTime(0);
          }
        }, 15000);
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setRecordTime(0);
      clearInterval(timerRef.current!);
    }
  };

  const uploadAudio = () => {
    if (audioBlob) {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recorded_audio.webm");

      fetch("http://localhost:3002/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })
        .then((response) => {
          if (response.status === 401) {
            setUploadMessage("Authentication error: Please log in again.");
            return Promise.reject("Authentication error");
          }
          return response.json();
        })
        .then((data) => {
          if (data.message === "File uploaded successfully. The audio file is being processed in the background.") {
            setUploadMessage("Upload successful, transcription is being processed. Please wait...");
          } else if (data.transcript) {
            setUploadMessage("Upload and transcription successful.");
            onTranscriptionUpload(data.transcript); // Pass the transcript to the parent component
          } else {
            setUploadMessage("Upload failed: " + data.message);
          }
        })
        .catch((error) => {
          console.error("Error uploading audio:", error);
          setUploadMessage("Upload failed: " + error);
        });
    }
  };

  const saveAudioLocally = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";
      a.href = url;

      const fileName = "recorded_audio.webm";
      a.download = fileName;
      a.click();

      window.URL.revokeObjectURL(url);
    }
  };

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div>
      <Button
        variant="contained"
        style={{
          backgroundColor: "green",
          marginBottom: "0.5rem",
          fontSize: "0.75rem",
        }}
        onClick={startRecording}
        disabled={recording}
      >
        Start Recording
      </Button>
      <Button
        variant="contained"
        style={{
          backgroundColor: "red",
          marginBottom: "0.5rem",
          fontSize: "0.75rem",
        }}
        onClick={stopRecording}
        disabled={!recording}
      >
        Stop Recording
      </Button>
      <Button
        variant="contained"
        style={{
          marginBottom: "0.5rem",
          fontSize: "0.75rem",
        }}
        onClick={uploadAudio}
        disabled={!audioBlob}
      >
        Upload Audio
      </Button>
      <Button
        variant="contained"
        style={{
          marginBottom: "0.5rem",
          fontSize: "0.75rem",
        }}
        onClick={saveAudioLocally}
        disabled={!audioBlob}
      >
        Save Locally
      </Button>
      <p style={{ fontSize: "0.85em", fontWeight: "bold" }}>
        Recording Time: {recordTime} seconds
      </p>
      <p>{uploadMessage}</p>
      <canvas
        ref={canvasRef}
        width="500"
        height="100"
        style={{
          border: "1px solid #000",
          marginTop: "10px",
        }}
      />
    </div>
  );
};

export default AudioRecorder;