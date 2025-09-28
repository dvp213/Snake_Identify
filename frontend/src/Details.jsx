import React, { useState, useEffect } from "react";
import "./App.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";

function Details() {
  const navigate = useNavigate();
  const { snakeId } = useParams();
  const location = useLocation();
  const [snake, setSnake] = useState(null);

  // Default language is Sinhala
  const [language, setLanguage] = useState("si");

  useEffect(() => {
    // Get snake data from location state or fetch from API
    if (location.state?.snake) {
      setSnake(location.state.snake);
    } else if (snakeId) {
      // Fetch snake data using snakeId
      fetch(`${import.meta.env.VITE_API_BASE_URL}/snake/${snakeId}`)
        .then((res) => res.json())
        .then((data) => setSnake(data))
        .catch((error) => console.error("Error fetching snake data:", error));
    }
  }, [snakeId, location.state]);

  return (
    <div className="details-wrapper">
      {snake ? (
        <>
          <div className="details-left">
            <div className="title-row">
              <h1 className="details-title">
                {language === "en" ? snake.english_name : snake.sinhala_name}
                <span className="details-subtitle">
                  {` (${snake.scientific_name})`}
                </span>
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
              {language === "en" ? snake.description_en : snake.description_si}
            </p>

            {/* Buttons remain always in English */}
            <div className="button-group">
              <button className="back-button" onClick={() => navigate("/admin")}>
                Go back
              </button>

              <button
                className="action-button"
                onClick={() => navigate(`/related/${snake.id}`)}
              >
                Related Species
              </button>

              <button className="action-button" onClick={() => navigate("/chatbot")}>
                Chat
              </button>
            </div>
          </div>

          <div className="details-right">
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${snake.image}`}
              alt={`${snake.english_name} image`}
              className="combined-image"
            />
          </div>
        </>
      ) : (
        <div className="loading">Loading...</div>
      )}
    </div>
  );
}

export default Details;
