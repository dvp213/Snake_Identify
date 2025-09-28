import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./styles/AdminDashboard.css";
import { useAuth } from "./contexts/AuthContext";

function Admin() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, isLoading } = useAuth();
  const [snakes, setSnakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only redirect if we're done loading and user is not authenticated or not admin
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate('/');
    }

    // Fetch snake data
    const fetchSnakes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/snake/all`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSnakes(data);
        }
      } catch (error) {
        console.error('Error fetching snakes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchSnakes();
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  // Show loading state
  if (isLoading || loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px'
      }}>
        Loading...
      </div>
    );
  }

  // Predefined categories
  const categories = [
    {
      id: "ceylonkrait",
      title: "Ceylonkrait (මුදු කරවලා)",
      englishName: "Ceylonkrait",
      sinhalaName: "මුදු කරවලා",
      class_label: "ceylonkrait"
    },
    {
      id: "commonkrait",
      title: "Commonkrait (තෙල් කරවලා)",
      englishName: "Commonkrait",
      sinhalaName: "තෙල් කරවලා",
      class_label: "commonkrait"
    },
    {
      id: "cobra",
      title: "Cobra (නයා)",
      englishName: "Cobra",
      sinhalaName: "නයා",
      class_label: "cobra"
    },
    {
      id: "russellsviper",
      title: "Russellsviper (තිත් පොළඟා)",
      englishName: "Russellsviper",
      sinhalaName: "තිත් පොළඟා",
      class_label: "russellsviper"
    },
    {
      id: "sawscaledviper",
      title: "Sawscaledviper (වැලි පොළඟා)",
      englishName: "Sawscaledviper",
      sinhalaName: "වැලි පොළඟා",
      class_label: "sawscaledviper"
    },
  ];

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-buttons">
          <button
            className="logout-button"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="category-grid">
        {categories.map(category => {
          // Convert category ID to numeric class label for comparison
          const categoryToLabel = {
            'ceylonkrait': '0',
            'cobra': '1',
            'commonkrait': '2',
            'russellsviper': '3',
            'sawscaledviper': '4'
          };
          // Find if there's existing data for this category
          const existingData = snakes.find(
            snake => snake.class_label === categoryToLabel[category.id]
          );

          return (
            <div key={category.id} className="category-card">
              <h2>{category.title}</h2>
              {existingData ? (
                <>
                  <img
                    src={`http://localhost:8000/${existingData.snakeimage}` || '/placeholder.png'}
                    alt={existingData.snakeenglishname}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/vite.svg';
                    }}
                  />
                  <div className="button-container">
                    <button
                      className="details-button"
                      onClick={() => navigate(`/details/${category.id}`, {
                        state: {
                          snake: {
                            id: category.id,
                            english_name: category.englishName,
                            sinhala_name: category.sinhalaName,
                            scientific_name: existingData?.scientific_name || "",
                            description_en: existingData?.description_en || "",
                            description_si: existingData?.description_si || "",
                            image: existingData?.image || ""
                          }
                        }
                      })}
                    >
                      More Details
                    </button>
                    <button
                      className="edit-button"
                      onClick={() => navigate(`/edit-category/${category.id}`, {
                        state: {
                          category,
                          existingData
                        }
                      })}
                    >
                      Edit Details
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="placeholder-image">
                    <span>No image uploaded</span>
                  </div>
                  <button
                    className="edit-button add-style"
                    onClick={() => navigate(`/edit-category/${category.id}`, {
                      state: {
                        category
                      }
                    })}
                  >
                    Add Details
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Admin;
