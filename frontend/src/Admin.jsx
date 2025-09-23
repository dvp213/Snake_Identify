import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Admin() {
  const navigate = useNavigate();

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
        onClick={() => navigate("/CreateAccount")}
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
