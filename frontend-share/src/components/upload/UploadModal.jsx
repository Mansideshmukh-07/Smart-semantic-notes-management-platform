import { useState, useRef } from "react";
// ── Import your custom axios configuration instance ─────────────────────────
//import api from "../api"; 
import api from "../../services/api";
export default function UploadModal({ show, onClose, onUploadFinished }) {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("digital");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Reference hook to trigger the hidden native file selector input element
  const fileInputRef = useRef(null);

  if (!show) return null;

  const handleZoneClick = () => {
    if (!isUploading) {
      fileInputRef.current.click();
    }
  };

  // ── True Multi-Part Network Request Integration ───────────────────────────
  const handleSubmit = async () => {
    if (!file) return;

    // 1. Instantiate browser multi-part FormData container
    const formData = new FormData();
    formData.append("file", file); // Raw binary data stream
    formData.append("subject", subject.strip ? subject.strip() : subject || "General");
    formData.append("file_type", type); // Maps precisely to expected backend views category

    try {
      setIsUploading(true);
      setErrorMessage("");

      // 2. Transmit across HTTP using our interceptor-ready instance
      const response = await api.post("/files/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Forces browser boundary signatures
        },
      });

      // 3. Callback to notify parent views (e.g., to refresh lists or update tracking indicators)
      if (onUploadFinished) {
        onUploadFinished(response.data);
      }

      // 4. Reset component local fields upon successful processing sequence
      setFile(null);
      setSubject("");
      setType("digital");
      onClose();
    } catch (error) {
      console.error("Pipeline request transmission fault:", error);
      setErrorMessage(
        error.response?.data?.error || "A processing fault occurred within the background data pipeline."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h3>Upload Study Document</h3>
        <p className="modal-subtitle">Add your code repositories, text summaries, or documentation directly here.</p>
        
        {/* INTERACTIVE DRAG-AND-DROP FILE ZONE */}
        <div 
          className={`modal-drag-zone ${isUploading ? "disabled-zone" : ""}`} 
          onClick={handleZoneClick}
          style={{ opacity: isUploading ? 0.6 : 1, cursor: isUploading ? "not-allowed" : "pointer" }}
        >
          <div className="upload-zone-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div className="upload-zone-text">
            {file ? file.name : "Click to select a document"}
          </div>
          <div className="upload-zone-hint">
            {file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports PDF, TXT, C, or Python scripts"}
          </div>
          
          {/* HIDDEN INJECTED NATIVE INPUT LINK */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden-file-input"
            disabled={isUploading}
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </div>

        {/* ERROR DISPLAY CONTAINER */}
        {errorMessage && (
          <div style={{ color: "#d9534f", margin: "10px 0", fontSize: "14px", fontWeight: "500" }}>
            ❌ {errorMessage}
          </div>
        )}

        {/* METADATA FIELD ARCHITECTURE: SUBJECT */}
        <div className="modal-field-group">
          <label>Subject Focus</label>
          <input
            className="modal-text-input"
            placeholder="e.g., GCC Analyzers, DBMS, Networking..."
            value={subject}
            disabled={isUploading}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* METADATA FIELD ARCHITECTURE: DOCUMENT TYPE */}
        <div className="modal-field-group">
          <label>Document Layout Format</label>
          <select 
            className="modal-text-input" 
            value={type} 
            disabled={isUploading}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="digital">Digital Code / Text File</option>
            <option value="handwritten">Handwritten Lecture Note</option>
          </select>
        </div>

        {/* CONTROL ACTION BUTTONS BAR */}
        <div className="modal-actions">
          <button 
            className="btn-modal-secondary" 
            onClick={onClose} 
            disabled={isUploading}
          >
            Cancel
          </button>
          
          <button 
            className="btn-modal-primary" 
            onClick={handleSubmit}
            disabled={!file || isUploading}
          >
            {isUploading ? "Processing..." : "Upload File"}
          </button>
        </div>
      </div>
    </div>
  );
}

