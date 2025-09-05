// App.tsx - File upload React component with upload history sidebar
import React, { useState } from "react";
// import "./App.css";

// API endpoint for file upload
const API_URL = import.meta.env.VITE_API_URL; // if using Vite

// Type for upload response
interface UploadResponse {
  filename: string;
  size: number;
}

function App() {
  // State for selected file
  const [file, setFile] = useState<File | null>(null);
  // State for upload response
  const [response, setResponse] = useState<UploadResponse | null>(null);
  // State for error messages
  const [error, setError] = useState<string | null>(null);
  // State for loading spinner
  const [isLoading, setIsLoading] = useState(false);
  // State for session upload history
  const [uploadHistory, setUploadHistory] = useState<UploadResponse[]>([]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files ? event.target.files[0] : null);
    setResponse(null);
    setError(null);
  };

  // Handle file upload
  const handleUpload = async () => {
    // Check if a file is selected
    if (!file) { 
      alert("Please select a file first");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const start = Date.now();

    try {
      // Send file to backend
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      // Parse response JSON
      const info = await res.json().catch(() => ({})); 

      // switch cases if errors come up with the upload
      if (!res.ok) {
        switch (res.status) {
          case 400:
            setError(info.detail || "File too large or invalid upload.");
            break;
          case 409:
            setError(info.detail || "File already exists in the upload folder.");
            break;
          case 413:
            setError(info.detail || "File too large to upload.");
            break;
          default:
            setError(`Unexpected error: ${res.status}`);
        }
        setResponse(null);
        // Ensure spinner is visible for at least 1 second
        const elapsed = Date.now() - start;
        if (elapsed < 1000) await new Promise(r => setTimeout(r, 1000 - elapsed));
        setIsLoading(false);
        return;
      }

      // Success: update response and history
      setResponse(info as UploadResponse);
      setError(null);
      setUploadHistory(prev => [...prev, info as UploadResponse]);
      console.log("Upload response:", info);
    } catch (err) {
      // Network error
      console.error("Upload error:", err);
      setError("Network error while uploading file.");
      setResponse(null);
    }
    // Ensure spinner is visible for at least 1 second
    const elapsed = Date.now() - start;
    if (elapsed < 1000) await new Promise(r => setTimeout(r, 1000 - elapsed));
    setIsLoading(false);
  };

  return (
    // Main flex container: upload form and history sidebar
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {/* Upload form and messages */}
      <div style={{ flex: 1 }}>
        <h1>Horizon Portal: Upload</h1>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={isLoading}>Upload</button>
        {isLoading && (
          // Loading spinner when uploading: just for UX
          <div style={{ margin: '1rem', textAlign: 'center' }}>
            <span className="spinner" />
            <div>Uploading...</div>
          </div>
        )}
        {/* Success message */}
        {!isLoading && response && (
          <div className="success">
            <ul style={{ listStyleType: "none", margin: 0, paddingLeft: "1em" }}>
              <li> ✅ Upload successful! </li> 
              <li>Filename: {response.filename}</li> 
              <li>Size: {response.size} MBs</li>
            </ul>
          </div>
        )}
        {/* Error message */}
        {!isLoading && error && (
          <div className="error">
            ❌ Upload failed: {error} 
          </div>
        )}
      </div>
      {/* Upload history sidebar */}
      <div style={{ flex: '0 0 30%', marginLeft: 32, background: '#23272f', borderRadius: 10, padding: 16, minHeight: 200, maxHeight: 350, boxShadow: '0 2px 8px #0002', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.2em', color: '#aaa', marginTop: 0 }}>Upload History</h2>
        {uploadHistory.length === 0 ? (
          <div style={{ color: '#aaa' }}>No uploads yet this session.</div>
        ) : (
          <ul style={{ paddingLeft: 0, listStyle: 'none', fontSize: '0.98em', margin: 0 }}>
            {uploadHistory.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 10, background: '#1e1e1e', borderRadius: 6, padding: '8px 10px', color: '#fff', boxShadow: '0 1px 3px #0001' }}>
                <div style={{ fontWeight: 500 }}>{item.filename}</div>
                <div style={{ fontSize: '0.95em', color: '#7fffa0' }}>Size: {item.size} MBs</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;