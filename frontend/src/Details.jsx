import React, { useState, useEffect } from "react";
import "./App.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

function Details() {
  const navigate = useNavigate();
  const { snakeId } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [snake, setSnake] = useState(null);
  const [relatedSnakes, setRelatedSnakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRelatedSnake, setSelectedRelatedSnake] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Default language is Sinhala
  const [language, setLanguage] = useState("si");

  useEffect(() => {
    const identifySnake = async () => {
      try {
        setLoading(true);
        // Check if we have an uploaded image from the home screen
        if (location.state?.image) {
          const imageData = location.state.image;

          // Convert base64 to blob
          const fetchResponse = await fetch(imageData);
          const blob = await fetchResponse.blob();

          // Create form data
          const formData = new FormData();
          formData.append('image', blob, 'image.jpg');

          // Send to the backend
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/snake-related/identify-with-related`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to identify snake: ${response.statusText}`);
          }

          const data = await response.json();
          setSnake(data.snake);
          setRelatedSnakes(data.related_snakes);
        } else if (location.state?.snake) {
          setSnake(location.state.snake);
        } else if (snakeId) {
          // Fetch snake data using snakeId
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/snake/${snakeId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch snake: ${response.statusText}`);
          }
          const data = await response.json();
          setSnake(data);
        }
      } catch (err) {
        console.error("Error processing snake data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    identifySnake();
  }, [snakeId, location.state]);

  return (
    <div className="details-container">
      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : snake ? (
        <div className="details-page-container">
          <button className="back-button details-back" onClick={() => navigate("/")}>Go back</button>

          <div className="details-content">
            <div className="details-wrapper">
              <div className="details-right">
                <img
                  src={snake.image_data || `${import.meta.env.VITE_API_BASE_URL}/snake/image/${snake.snakeid}`}
                  alt={`${snake.snakeenglishname} image`}
                  className="combined-image"
                  onError={(e) => {
                    console.error("Failed to load image");
                    e.target.onerror = null;
                    e.target.src = '/vite.svg';
                  }}
                />
              </div>

              <div className="details-left">
                <div className="title-row">
                  <h1 className="details-title">
                    {language === "en" ? snake.snakeenglishname : snake.snakesinhalaname}
                  </h1>

                  {/* Language Dropdown */}
                  <select
                    className="lang-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="si">සිංහල</option>
                  </select>
                </div>

                <p className="details-text">
                  {language === "en" ? snake.snakeenglishdescription : snake.snakesinhaladescription}
                </p>

                <div className="button-group">
                  <button
                    className="action-button"
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate("/chatbot", { state: { snakeName: snake.snakeenglishname } });
                      } else {
                        navigate("/login", {
                          state: {
                            redirectTo: "/chatbot",
                            snakeName: snake.snakeenglishname,
                            message: "Please log in to use the snake identification chatbot"
                          }
                        });
                      }
                    }}
                  >
                    Ask about this snake
                  </button>
                </div>
              </div>
            </div>

            {/* Related Snakes Section */}
            {relatedSnakes && relatedSnakes.length > 0 && (
              <div className="related-snakes-section">
                <h2 className="related-title">Related Species</h2>
                <div className="related-snakes-grid">
                  {relatedSnakes.map((relatedSnake) => (
                    <div key={relatedSnake.snakeid} className="related-snake-card">
                      <img
                        src={relatedSnake.image_data || `${import.meta.env.VITE_API_BASE_URL}/snake/image/${relatedSnake.snakeid}`}
                        alt={`${relatedSnake.snakeenglishname} image`}
                        className="related-snake-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/vite.svg';
                        }}
                      />
                      <h3 className="related-snake-name">
                        {language === "en"
                          ? relatedSnake.snakeenglishname
                          : relatedSnake.snakesinhalaname || relatedSnake.snakeenglishname}
                      </h3>
                      <button
                        className="view-details-button"
                        onClick={() => {
                          setSelectedRelatedSnake(relatedSnake);
                          setShowModal(true);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="not-found">Snake not found</div>
      )}

      {/* Modal for Related Snake Details */}
      {showModal && selectedRelatedSnake && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="snake-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowModal(false)}>×</button>
            <div className="modal-content">
              <div className="modal-image-container">
                <img
                  src={selectedRelatedSnake.image_data || `${import.meta.env.VITE_API_BASE_URL}/snake/image/${selectedRelatedSnake.snakeid}`}
                  alt={`${selectedRelatedSnake.snakeenglishname} image`}
                  className="modal-snake-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/vite.svg';
                  }}
                />
              </div>
              <div className="modal-details">
                <h2 className="modal-title">
                  {language === "en"
                    ? selectedRelatedSnake.snakeenglishname
                    : selectedRelatedSnake.snakesinhalaname || selectedRelatedSnake.snakeenglishname}
                </h2>
                <div className="modal-description">
                  {language === "en"
                    ? selectedRelatedSnake.snakeenglishdescription
                    : selectedRelatedSnake.snakesinhaladescription || selectedRelatedSnake.snakeenglishdescription}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Details;