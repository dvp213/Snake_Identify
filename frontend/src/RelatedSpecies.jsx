import React, { useState, useEffect } from "react";
import "./App.css";
import { useNavigate, useLocation } from "react-router-dom";
import catSnakeImg from "./assets/catSnakeImg.jpg";  // Keep as fallback
import wolfSnakeImg from "./assets/wolfSnakeImg.jpg"; // Keep as fallback

function RelatedSpecies() {
  const navigate = useNavigate();
  const location = useLocation();
  const { snakeId, snakeName } = location.state || {};
  const [relatedSnakes, setRelatedSnakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch related snakes if we have a snakeId
    const fetchRelatedSnakes = async () => {
      if (!snakeId) {
        setRelatedSnakes([]);
        setLoading(false);
        return;
      }

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${apiBaseUrl}/snake/related/${snakeId}`);
        
        if (response.ok) {
          const data = await response.json();
          setRelatedSnakes(data);
        } else {
          setError(`Failed to fetch related snakes: ${response.status}`);
        }
      } catch (error) {
        setError(`Error fetching related snakes: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedSnakes();
  }, [snakeId]);

  // Use the fallback content if we don't have real data
  const renderFallbackContent = () => (
    <>
      <div className="species-box">
        <div className="species-details">
          <h3>
            Ceylon Cat Snake{" "}
            <span className="italic">(Boiga ceylonensis)</span>
          </h3>
          <p>
            The Ceylon Cat Snake (Boiga ceylonensis) is an endemic species found only in Sri Lanka. It is a slender, nocturnal, mildly venomous colubrid that primarily inhabits forests, home gardens, and cultivated areas. Its body is usually brown to reddish-brown with faint crossbands, giving it a superficial resemblance to kraits, which often leads to misidentification. Although rear-fanged and mildly venomous, it poses little threat to humans, with its venom being effective mainly on small prey such as lizards, frogs, and geckos.
          </p>
        </div>
        <div className="species-image">
          <img src={catSnakeImg} alt="Ceylon Cat Snake" />
        </div>
      </div>

      <div className="species-box">
        <div className="species-details">
          <h3>
            Wolf Snake <span className="italic">(Lycodon aulicus)</span>
          </h3>
          <p>
            The Wolf Snake (Lycodon aulicus) is a non-venomous snake commonly found in Sri Lanka and across South Asia. It is slender with distinctive black-and-white banding, which often causes people to mistake it for the highly venomous krait. Despite its resemblance, the wolf snake is harmless to humans and mainly feeds on lizards, small rodents, and geckos.
          </p>
        </div>
        <div className="species-image">
          <img src={wolfSnakeImg} alt="Wolf Snake" />
        </div>
      </div>
    </>
  );

  return (
    <div className="related-page">
      {/* Back button + Title outside */}
      <div className="related-header">
        <button
          className="back-button4"
          onClick={() => navigate(-1)} // Go back to previous page
        >
          Go back
        </button>
      </div>
      <h1 className="related-title">
        Related Species{" "}
        <span className="related-subtitle">
          {snakeName ? `(Similar to ${snakeName})` : "(Similar snake species)"}
        </span>
      </h1>
      
      {/* Container for species boxes */}
      <div className="related-container">
        {loading ? (
          <div className="loading">Loading related species...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : relatedSnakes.length > 0 ? (
          relatedSnakes.map(snake => (
            <div key={snake.snakeid} className="species-box">
              <div className="species-details">
                <h3>
                  {snake.snakeenglishname}{" "}
                  <span className="italic">({snake.snakesinhalaname})</span>
                </h3>
                <p>{snake.snakeenglishdescription}</p>
              </div>
              <div className="species-image">
                {snake.image_data ? (
                  <img 
                    src={snake.image_data} 
                    alt={snake.snakeenglishname} 
                    onError={(e) => {
                      e.target.onerror = null;
                      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
                      e.target.src = `${apiBaseUrl}/snake/image/${snake.snakeid}`;
                    }}
                  />
                ) : (
                  <img 
                    src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/snake/image/${snake.snakeid}`} 
                    alt={snake.snakeenglishname} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/vite.svg';
                    }}
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            <p>No related species found for this snake.</p>
            {renderFallbackContent()}
          </div>
        )}
      </div>
    </div>
  );
}

export default RelatedSpecies;
