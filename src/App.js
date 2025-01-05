import React, { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import "./App.css";  // Import the CSS file

function App() {
  const [files, setFiles] = useState([]);
  const [outputImage, setOutputImage] = useState(null);
  const [viewerUrl, setViewerUrl] = useState(null);
  const [directUrl, setDirectUrl] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const handlePaste = useCallback((e) => {
    if (e.clipboardData.files.length > 0) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...Array.from(e.clipboardData.files),
      ]);
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles([...files, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const createCollage = async () => {
    if (files.length !== 4) {
      alert("Please upload exactly 4 images.");
      return;
    }
  
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      // Make POST request to Flask backend
      const response = await axios.post("https://backend-pvan.onrender.com/create-collage/", formData, {
        responseType: "json",
      });

      const { viewer_url, direct_url } = response.data;
      
      setViewerUrl(viewer_url);
      setDirectUrl(direct_url);
      setOutputImage(viewer_url); // Display the image after upload
    } catch (error) {
      console.error("Error creating collage:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    accept: "image/*",
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container">
      <h1 className="title">Image Collage Creator</h1>

      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} onChange={handleFileChange} />
        <p>Drag & Drop your files here or click to select files</p>
        <p>Or use Ctrl+V to paste images</p>
      </div>

      <div className="file-previews">
        {files.map((file, index) => (
          <div key={index} className="file-preview">
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="image-preview"
            />
            <button
              onClick={() => handleRemoveFile(index)}
              className="remove-button"
            >
              X
            </button>
          </div>
        ))}
      </div>

      <button onClick={createCollage} className="create-button" disabled={files.length !== 4}>
        Create Magic
      </button>

      {outputImage && (
        <div className="output-container">
          <h2>Collage Output</h2>
          <img src={outputImage} alt="Collage" className="output-image" />
          <div className="output-actions">
            <a href={outputImage} target="_blank" rel="noreferrer" className="action-link">
              Open in New Tab
            </a>
            <a href={outputImage} download="collage.jpg" className="action-link">
              Save Image
            </a>
          </div>

          {/* Viewer URL */}
          {viewerUrl && (
            <div className="url-container">
              <p>
                <strong>Viewer URL:</strong>
                <span className="url-text">{viewerUrl}</span>
              </p>
              <button className="copy-button" onClick={() => copyToClipboard(viewerUrl)}>
                Copy
              </button>
            </div>
          )}

          {/* Direct URL */}
          {directUrl && (
            <div className="url-container">
              <p>
                <strong>Direct URL:</strong>
                <span className="url-text">{directUrl}</span>
              </p>
              <button className="copy-button" onClick={() => copyToClipboard(directUrl)}>
                Copy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
