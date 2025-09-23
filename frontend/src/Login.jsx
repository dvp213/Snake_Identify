import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ IMPORT THIS
import "./App.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); 

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/"); 
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
          <input type="email" id="email" placeholder="Enter your email" />

          <label htmlFor="password" className="input1 input2">Your password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
            />
            <span
              className="toggle-password"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <a href="#" className="forgot-password">Forget your password?</a>
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
