import React, { useEffect, useRef, useState } from "react";
const axios = require('axios');
const step1 = "Put the swab in your left nostril"
const step2 = "Put the swab in your right nostril"
const finalStep = "Put in solution."
let currentStep = step1
function nextStep(newPrediction) {
  switch (currentStep) {
    case step1:
      if (newPrediction == "L") {
        currentStep = step2
      }
      break;
    case step2:
      if (newPrediction == "R") {
        currentStep = finalStep
      }
      break;
    default:
      break;
  }

}
const Classifier = () => {
  const canvasRef = useRef();
  const imageRef = useRef();
  const videoRef = useRef();

  const [result, setResult] = useState("");

  useEffect(() => {
    async function getCameraStream() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };

    getCameraStream();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      captureImageFromCamera();

      if (imageRef.current) {
        const formData = new FormData();
        formData.append('image', imageRef.current);

        var config = {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
        axios.post("http://127.0.0.1:5000/classify",
          formData, config
        )
          .then(function (response) {
            console.log(response.data.finalResult);
            nextStep(response.data.finalResult)
            setResult(response.data.finalResult)
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const playCameraStream = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const captureImageFromCamera = () => {
    const context = canvasRef.current.getContext('2d');
    const { videoWidth, videoHeight } = videoRef.current;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

    canvasRef.current.toBlob((blob) => {
      imageRef.current = blob;
    })
  };

  return (
    <>
      <header>
        <h1>Xtrava GP '21</h1>
      </header>
      <main>
        <h3>Please {currentStep}</h3>
        <video ref={videoRef} onCanPlay={() => playCameraStream()} id="video" />
        <canvas ref={canvasRef} hidden></canvas>
        <p>Currently seeing: {result}</p>
      </main>
    </>
  )
};

export default Classifier;