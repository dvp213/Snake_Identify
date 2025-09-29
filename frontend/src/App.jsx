import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleUploadClick = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmUpload = () => {
    if (selectedFile) {
      navigate("/Details", { state: { image: previewUrl } });
    }
  };

  return (
    <div className={`container ${showModal ? "blurred" : ""}`}>
      {!isAuthenticated ? (
        <button className="signin-button" onClick={() => navigate("/Login")}>
          Sign In / Sign Up
        </button>
      ) : (
        <button
          className="signin-button"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Sign Out
        </button>
      )}

      <div className="text-content">
        <h1 className="title">Identify</h1>
        <p className="subtitle">
          Highly Venomous Snakes <br />
          <span className="location">in Sri Lanka</span>
        </p>
      </div>

      <div className="divider"></div>

      <div className="button-group">
        <button className="upload-button" onClick={handleUploadClick}>
          Upload photo
        </button>
        <button className="ask-button" onClick={() => {
          if (isAuthenticated) {
            navigate("/Chatbot");
          } else {
            navigate("/Login", {
              state: {
                redirectTo: "/Chatbot",
                message: "Please log in to use the snake identification chatbot"
              }
            });
          }
        }}>
          Ask about snakes
        </button>
      </div>

      <button className="contact-button" onClick={() => setShowContact(true)}>
        Contact us
      </button>

      {/* ✅ Contact Slider */}
      <div className={`contact-slider ${showContact ? "open" : ""}`}>
        <div className="contact-header">
          <h2>Contact Us</h2>
          <button className="close-contact" onClick={() => setShowContact(false)}>×</button>
        </div>
        <div className="contact-body">
          <p>Email: support@snakesrilanka.org</p>
          <p>Phone: +94 71 123 4567</p>
          <p>Address: Uva Wellassa University, Badulla</p>
          <form className="contact-form">
            <input type="text" placeholder="Your Name" />
            <input type="email" placeholder="Your Email" />
            <textarea placeholder="Your Message"></textarea>
            <button type="submit">Send</button>
          </form>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Upload photo</h2>
            <hr />
            <label className="upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="image-preview" />
              ) : (
                <div className="upload-placeholder">
                  <span className="plus-icon">+</span>
                  <p>Upload snake photo</p>
                </div>
              )}
            </label>

            <div className="modal-buttons">
              <button
                className="upload-confirm"
                onClick={handleConfirmUpload}
                disabled={!selectedFile}
              >
                Upload
              </button>
              <button className="upload-cancel" onClick={handleCloseModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
