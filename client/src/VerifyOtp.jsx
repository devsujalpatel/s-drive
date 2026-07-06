import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import useAuthStore from "./store/useAuthStore";

const VerifyOtp = () => {
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [otp, setOtp] = useState("");
  const [serverError, setServerError] = useState("");

  const { email } = useAuthStore();

  const navigate = useNavigate();

  const handleChange = (e) => {
    setOtp(e.target.value);

    if (serverError) {
      setServerError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/user/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setServerError(data.error);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      setServerError("Something went wrong. Please try again.");
    }
  };

  const hasError = Boolean(serverError);

  return (
    <div className="container">
      <h2 className="heading">Verify OTP</h2>

      <p className="link-text" style={{ marginBottom: "20px" }}>
        We've sent a verification code to
        <br />
        <strong>{email}</strong>
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="otp" className="label">
            OTP
          </label>

          <input
            className={`input ${hasError ? "input-error" : ""}`}
            type="text"
            id="otp"
            name="otp"
            value={otp}
            onChange={handleChange}
            placeholder="Enter 4-digit OTP"
            maxLength={4}
            inputMode="numeric"
            required
          />

          {serverError && <span className="error-msg">{serverError}</span>}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={otp.length !== 4}
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;