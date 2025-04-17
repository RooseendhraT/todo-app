import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/home"); // Redirect to Home page after login
    } catch (error) {
      setError("Login failed. Please try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      <h2>Login</h2>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        Login with Google
      </button>
    </div>
  );
};

export default Login;
