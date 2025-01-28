import React, { useState } from "react";
import axios from "axios";
import "./App.css"

const PassportUploader = () => {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [qualityMessage, setQualityMessage] = useState("");
  const [attempt, setAttempt] = useState(1);
  const [uploadMethod, setUploadMethod] = useState("url"); // "url" or "upload"
  const [imageUrl, setImageUrl] = useState("");
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");

  const API_USER = "660609319";
  const API_SECRET = "Zyt8U7tpJKFzPmP54dtnuqFiZh59bs8y";

  // Handle Image Upload for Direct File Upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result); // Display image preview
        setImageFile(file); // Save file for upload
        checkImageQualityByUpload(file); // Check quality
      };
      reader.readAsDataURL(file);
    }
  };

  const checkImageQualityByUpload = async (file) => {
    const formData = new FormData();
    formData.append("media", file);
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

      // Log the full response for debugging purposes
      console.log("Full API response:", response.data);

      // Check if 'quality' exists in the response and fetch the score
      if (response.data?.quality) {
        const qualityScore = response.data.quality.score; // Use 'score' here, not 'assessment'

        // Check if 'score' exists within the 'quality' object
        if (qualityScore !== undefined) {
          evaluateQuality(qualityScore);
        } else {
          setQualityMessage("Quality score missing in the response. Please try again.");
        }
      } else {
        setQualityMessage("Quality data missing in the response. Please try again.");
      }
    } catch (error) {
      console.error("Error checking image quality by upload:", error);
      setQualityMessage("Error checking image quality. Please try again.");
    }
  };

  // Handle Image URL Input
  const handleUrlSubmit = async () => {
    if (imageUrl.trim() !== "") {
      setImage(imageUrl);
      checkImageQualityByUrl(imageUrl);
    } else {
      setQualityMessage("Please provide a valid image URL.");
    }
  };

  const checkImageQualityByUrl = async (url) => {
    try {
      const response = await axios.get(
        "https://api.sightengine.com/1.0/check.json",
        {
          params: {
            url: url,
            models: "quality",
            api_user: API_USER,
            api_secret: API_SECRET,
          },
        }
      );

      // Log the full response for debugging purposes
      console.log("Full API response for URL:", response.data);

      // Check if 'quality' exists in the response and fetch the score
      if (response.data?.quality) {
        const qualityScore = response.data.quality.score; // Use 'score' here, not 'assessment'

        // Check if 'score' exists within the 'quality' object
        if (qualityScore !== undefined) {
          evaluateQuality(qualityScore);
        } else {
          setQualityMessage("Quality score missing in the response. Please try again.");
        }
      } else {
        setQualityMessage("Quality data missing in the response. Please try again.");
      }
    } catch (error) {
      console.error("Error checking image quality by URL:", error);
      setQualityMessage("Error checking image quality. Please try again.");
    }
  };

  // Evaluate Image Quality and Prompt for Re-upload
  const evaluateQuality = (qualityScore) => {
    if (qualityScore >= 0.6) {
      setQualityMessage("The Passport image is of good quality.");
      setUploadSuccessMessage("Passport uploaded successfully!");
    } else if (attempt === 1) {
      setQualityMessage("The image is not clear. Please upload a better version.");
      setImage(null); // Reset image for re-upload
      setAttempt(2);
    } else {
      setQualityMessage("The image quality is still poor. Please try uploading it again with better quality.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Passport Image Uploader</h1>

      <div className="mb-4">
        <label>
          <input
            type="radio"
            name="uploadMethod"
            value="url"
            checked={uploadMethod === "url"}
            onChange={() => setUploadMethod("url")}
          />
          Upload by URL
        </label>
        <label className="ml-4">
          <input
            type="radio"
            name="uploadMethod"
            value="upload"
            checked={uploadMethod === "upload"}
            onChange={() => setUploadMethod("upload")}
          />
          Upload File
        </label>
      </div>

      {uploadMethod === "url" && (
        <div>
          <input
            type="text"
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <button
            onClick={handleUrlSubmit}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Submit URL
          </button>
        </div>
      )}

      {uploadMethod === "upload" && (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="border p-2 rounded"
        />
      )}

      {image && (
        <div>
          <h2 className="text-lg font-bold mt-4">Uploaded Image:</h2>
          <img
            src={image}
            alt="Uploaded Passport"
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
