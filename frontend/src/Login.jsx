import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import { useAuth } from "./contexts/AuthContext";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Check if we have a message or redirect info from the previous page
  const redirectTo = location.state?.redirectTo;
  const snakeName = location.state?.snakeName;
  const message = location.state?.message;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        // Use the auth context to login
        login(data.access_token, data.is_admin);

        // Redirect based on redirect info or user type
        if (redirectTo === "/chatbot" && snakeName) {
          navigate("/chatbot", { state: { snakeName } });
        } else if (data.is_admin) {
          navigate("/Admin");
        } else {
          navigate("/");
        }
      } else {
        setError(data.detail || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.", err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="full-container">
      <div className="text-content">
        <h1 className="title">Identify</h1>
        <p className="subtitle">
          Highly Venomous Snakes <br />
          <span className="location">in Sri Lanka</span>
        </p>
        <div className="divider"></div>
      </div>

      <div className="login-container">
        <p className="subtitlelogin">Login</p>
        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="email" className="input1">Your email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password" className="input1 input2">Your password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="toggle-password"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <a href="#" className="forgot-password">Forget your password?</a>
          {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
          {message && <div className="info-message" style={{ color: '#b1903e', marginTop: '10px', fontWeight: '500' }}>{message}</div>}
          <button
            type="submit"
            className="login-button input1 input3"
          >
            Log in
          </button>
        </form>

        <div className="logindivider"></div>
        <button className="create-account-button" onClick={() => navigate("/CreateAccount")}>Create an account</button>
      </div>
    </div>
  );
}

export default Login;
