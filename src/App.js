import React, { useEffect, useState, useRef } from "react";
import { Grid, Box, Button } from "@material-ui/core";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";

function App() {
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }));
  const classes = useStyles();

  const webcamRef = React.useRef(null);

  const [videoWidth, setVideoWidth] = useState(960);
  const [videoHeight, setVideoHeight] = useState(640);

  const [model, setModel] = useState();

  // loading the pre-trained model
  async function loadModel() {
    try {
      const model = await cocoSsd.load();
      setModel(model);
      console.log("setloadedModel");
    } catch (err) {
      console.log(err);
      console.log("failed load model");
    }
  }

  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);

  async function predictFunction() {
    const predictions = await model.detect(document.getElementById("img"));
    // setVideoHeight(webcamRef.current.video.videoHeight);
    // setVideoWidth(webcamRef.current.video.videoWidth);
    var cnvs = document.getElementById("myCanvas");
    cnvs.width = webcamRef.current.video.videoWidth;
    cnvs.height = webcamRef.current.video.videoHeight;
    // cnvs.style.position = "absolute";

    var ctx = cnvs.getContext("2d");
    ctx.clearRect(
      0,
      0,
      webcamRef.current.video.videoWidth,
      webcamRef.current.video.videoHeight
    );

    if (predictions.length > 0) {
      // setPredictionData(predictions);
      console.log(predictions);
      for (let n = 0; n < predictions.length; n++) {
        // Check scores
        console.log(n);
        if (predictions[n].score > 0.8) {
          let bboxLeft = predictions[n].bbox[0];
          let bboxTop = predictions[n].bbox[1];
          let bboxWidth = predictions[n].bbox[2];
          let bboxHeight = predictions[n].bbox[3];
          console.log("bboxLeft: " + bboxLeft);
          console.log("bboxTop: " + bboxTop);

          console.log("bboxWidth: " + bboxWidth);

          console.log("bboxHeight: " + bboxHeight);

          ctx.beginPath();
          ctx.font = "28px Arial";
          ctx.fillStyle = "red";

          ctx.fillText(
            predictions[n].class +
              ": " +
              Math.round(parseFloat(predictions[n].score) * 100) +
              "%",
            bboxLeft,
            bboxTop
          );

          ctx.rect(bboxLeft, bboxTop, bboxWidth, bboxHeight);
          ctx.strokeStyle = "#FF0000";

          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    }

    setTimeout(() => predictFunction(), 100);
  }

  const videoConstraints = {
    height: 1080,
    width: 1920,
    maxWidth: "50vw",
    facingMode: "environment",
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        marginTop: -3,
      }}
    >
      <Grid
        container
        style={{
          height: "100vh",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          padding: 10,
        }}
      >
        <Grid
          item
          xs={12}
          md={12}
          style={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <>
            <Box mt={2} />
            {
              <Button
                variant={"contained"}
                style={{
                  color: "white",
                  backgroundColor: "blueviolet",
                  width: "50%",
                  maxWidth: "250px",
                  position: "relative",
                  bottom: "325px",
                }}
                onClick={() => {
                  predictFunction();
                }}
              >
                Start Detecting
              </Button>
            }
            <Box mt={2} />{" "}
          </>
          <div style={{ position: "absolute", top: "80px", zIndex: "1" }}>
            <canvas
              id="myCanvas"
              width={videoWidth}
              height={videoHeight}
              style={{ backgroundColor: "transparent" }}
            />
          </div>
          <div style={{ position: "absolute", top: "80px" }}>
            <Webcam
              audio={false}
              id="img"
              ref={webcamRef}
              screenshotQuality={1}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
