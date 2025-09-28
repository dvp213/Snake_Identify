import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function CreateAccount() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        alert("Account created successfully!");
        navigate("/Login");
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to create account");
      }
    } catch (error) {
      alert("Error creating account: " + error.message);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="full-container-create-account">
      <div className="text-content">
        <h1 className="title">Identify</h1>
        <p className="subtitle">
          Highly Venomous Snakes <br />
          <span className="location">in Sri Lanka</span>
        </p>
        <div className="divider"></div>
      </div>

      <div className="login-container">
        <p className="subtitlelogin">Create Account</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email" className="input1">Your email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password" className="input1 input2">Your password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              className="toggle-password"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>
          <button
            type="submit"
            className="login-button input1 input3"
          >
            Create Account
          </button>
        </form>

        <div className="logindivider"></div>
        <button className="create-account-button" onClick={() => navigate("/Login")}>Login</button>
      </div>
    </div>
  );
}

export default CreateAccount;
