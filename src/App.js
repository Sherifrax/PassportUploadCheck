import React, { useState, useCallback } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { getCroppedImg } from "./canvasUtils"; // Utility function for cropping
import "./App.css";

const PassportUploader = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [qualityMessage, setQualityMessage] = useState("");
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");
  const [attempt, setAttempt] = useState(1);

  const API_USER = "660609319";
  const API_SECRET = "Zyt8U7tpJKFzPmP54dtnuqFiZh59bs8y";

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const checkImageQuality = useCallback(async (image) => {
    const formData = new FormData();
    const blob = await fetch(image).then((res) => res.blob());
    formData.append("media", blob);
    formData.append("models", "quality");
    formData.append("api_user", API_USER);
    formData.append("api_secret", API_SECRET);

    try {
      const response = await axios.post(
        "https://api.sightengine.com/1.0/check.json",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.quality) {
        const qualityScore = response.data.quality.score;
        if (qualityScore !== undefined) {
          evaluateQuality(qualityScore);
        } else {
          setQualityMessage("Quality score missing in the response. Please try again.");
        }
      } else {
        setQualityMessage("Quality data missing in the response. Please try again.");
      }
    } catch (error) {
      console.error("Error checking image quality:", error);
      setQualityMessage("Error checking image quality. Please try again.");
    }
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      setCroppedImage(croppedImage);
      checkImageQuality(croppedImage);
    } catch (e) {
      console.error("Error cropping image:", e);
    }
  }, [imageSrc, croppedAreaPixels, rotation, checkImageQuality]);

  const evaluateQuality = (qualityScore) => {
    if (qualityScore >= 0.6) {
      setQualityMessage("The Passport image is of good quality.");
      setUploadSuccessMessage("Passport uploaded successfully!");
    } else if (attempt === 1) {
      setQualityMessage("The image is not clear. Please upload a better version.");
      setImageSrc(null);
      setAttempt(2);
    } else {
      setQualityMessage("The image quality is still poor. Please try uploading it again with better quality.");
    }
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Passport Image Uploader</h1>

      {!imageSrc && (
        <input
          type="file"
          onChange={onFileChange}
          accept="image/*"
          className="border p-2 rounded w-full mb-4"
        />
      )}

      {imageSrc && (
        <div>
          <div className="crop-container">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={3 / 4} // Adjust aspect ratio as needed
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              cropShape="rect" // Rectangular cropping grid
              showGrid={true} // Show the cropping grid
            />
          </div>

          <div className="controls">
            <div className="slider-container">
              <Typography variant="overline" className="slider-label">
                Zoom
              </Typography>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e, zoom) => setZoom(zoom)}
              />
            </div>

            <div className="slider-container">
              <Typography variant="overline" className="slider-label">
                Rotation
              </Typography>
              <Slider
                value={rotation}
                min={0}
                max={360}
                step={1}
                onChange={(e, rotation) => setRotation(rotation)}
              />
            </div>

            <Button
              variant="contained"
              color="primary"
              onClick={showCroppedImage}
              className="crop-button"
            >
              Crop Image
            </Button>
          </div>
        </div>
      )}

      {croppedImage && (
        <div>
          <h2 className="text-lg font-bold mt-4">Cropped Image:</h2>
          <img
            src={croppedImage}
            alt="Cropped Passport"
            className="mt-2 border rounded"
          />
        </div>
      )}

      {qualityMessage && (
        <div className="mt-4 text-lg text-blue-600">{qualityMessage}</div>
      )}

      {uploadSuccessMessage && (
        <div className="mt-4 text-lg text-green-600">{uploadSuccessMessage}</div>
      )}
    </div>
  );
};

export default PassportUploader; 