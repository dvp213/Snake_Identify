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
        console.log("Fetching snakes data...");
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/snake/all`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Received snakes data:", data);
          setSnakes(data);
        } else {
          console.error("Error fetching snakes:", response.status, await response.text());
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

  // Define the mapping between category IDs and their numeric class labels
  const categoryToNumericClass = {
    'ceylonkrait': '0',    // Ceylonkrait (මුදු කරවලා)
    'cobra': '1',          // Cobra (නයා)
    'commonkrait': '2',    // Commonkrait (තෙල් කරවලා)
    'russellsviper': '3',  // Russellsviper (තිත් පොළඟා)
    'sawscaledviper': '4'  // Sawscaledviper (වැලි පොළඟා)
  };

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
          // Find if there's existing data for this category using numeric class label
          // Handle both string and numeric class labels for compatibility
          const existingData = snakes.find(snake => {
            const targetClass = categoryToNumericClass[category.id];
            return snake.class_label === targetClass || 
                   snake.class_label === parseInt(targetClass) ||
                   String(snake.class_label) === String(targetClass);
          });

          console.log(`Category ${category.id} (${categoryToNumericClass[category.id]}): `, existingData);
          console.log(`Looking for class label: ${categoryToNumericClass[category.id]}, comparing with snakes:`, snakes.map(s => ({id: s.snakeid, name: s.snakeenglishname, class: s.class_label})));

          return (
            <div key={category.id} className="category-card">
              <h2>{category.title}</h2>
              {existingData ? (
                <div className="button-container">
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
              ) : (
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Admin;
