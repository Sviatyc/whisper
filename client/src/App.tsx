import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import * as drawingUtils from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";

function App() {
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);

  const onResults = (results:any) => {
    console.log(results);
    if (!canvasRef.current || !cameraRef.current) return;
    
    canvasRef.current.width = cameraRef.current.video.videoWidth;
    canvasRef.current.height = cameraRef.current.video.videoHeight;
    
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
  
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
  
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawingUtils.drawConnectors(
          canvasCtx,
          landmarks,
          Hands.HAND_CONNECTIONS,
          { color: "#FFFFF", lineWidth: 1}
        );
        drawingUtils.drawLandmarks(canvasCtx, landmarks, {
          color: "#FFFFF",
          lineWidth: 1,
        });
      }
    }
    canvasCtx.restore();
  };
  
  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
  
    hands.setOptions({
      maxNumHands: 2,           
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  
    hands.onResults(onResults);
  
    if (cameraRef.current && cameraRef.current.video) {
      const camera = new Camera(cameraRef.current.video, {
        onFrame: async () => {
          await hands.send({ image: cameraRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);
  
  return (
    <div className="text-red-500">
      <Webcam
        style={{ position: "absolute", top: "0", left: "0" }}
        ref={cameraRef}
      />
      <canvas
        style={{ position: "absolute", top: "0", left: "0" }}
        ref={canvasRef}
      ></canvas>
    </div>
  );
}

export default App;
