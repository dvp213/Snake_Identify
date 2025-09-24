import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { useAuth } from "./contexts/AuthContext";

function Admin() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, isLoading } = useAuth();

  useEffect(() => {
    // Only redirect if we're done loading and user is not authenticated or not admin
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  // Show loading state
  if (isLoading) {
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

  const cards = [
    { title: "Ceylonkrait (මුදු කරවලා)", path: "/AdminCeylonkrait" },
    { title: "Commonkrait (තෙල් කරවලා)", path: "/AdminCeylonkrait" },
    { title: "Cobra (නයා)", path: "/AdminCeylonkrait" },
    { title: "Russellsviper (තිත් පොළඟා)", path: "/AdminCeylonkrait" },
    { title: "Sawscaledviper (වැලි පොළඟා)", path: "/AdminCeylonkrait" },
  ];

  return (
    <div className="admin-wrapper">
      <button
        className="signin-button"
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        Logout
      </button>

      <h1 className="AdminTitle">Admin Dashboard</h1>

      <div className="card-container">
        {cards.map((card, index) => (
          <div key={index} className="card">
            <h2>{card.title}</h2>
            <button onClick={() => navigate(card.path)}>Edit Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;
