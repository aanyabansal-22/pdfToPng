import React, { useState } from "react";

const ImageGrayScale = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file || null);
    setError("");
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setIsConverting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("http://127.0.0.1:5000/convertGrayscale", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to convert image to grayscale.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const originalName = selectedFile.name.replace(/\.[^/.]+$/, "");
      const link = document.createElement("a");
      link.href = url;
      link.download = `${originalName}_grayscale.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Image to Grayscale
      </h1>
      <p className="text-gray-600 mb-6">
        Upload an image and convert it to grayscale.
      </p>

      <div className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-3"
        />

        {selectedFile && (
          <p className="text-sm text-gray-600">
            Selected file: <span className="font-medium">{selectedFile.name}</span>
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleConvert}
          disabled={isConverting || !selectedFile}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-3 rounded-lg transition-colors"
        >
          {isConverting ? "Converting..." : "Convert to Grayscale"}
        </button>
      </div>
    </div>
  );
};

export default ImageGrayScale;