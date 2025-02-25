import React, { useState, useContext } from "react";
import { RecoveryContext } from "../App"; // Assure this context is correctly provided

export default function OTPInput() {
  const { OTP, setPage } = useContext(RecoveryContext);
  const [userInput, setUserInput] = useState("");
  const [error, setError] = useState(""); // Track error state

  // Handle OTP submission
  function handleSubmit() {
    // Validate if OTP input matches
    if (parseInt(userInput) === OTP) {
      alert("OTP correct, proceed to reset password.");
      setPage("reset-password"); // Transition to the reset-password page
    } else {
      setError("Invalid OTP. Please try again."); // Set error message for invalid OTP
    }
  }

  return (
    <div>
      <h2>Enter the OTP sent to your email</h2>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Enter OTP"
        maxLength={6} // Ensure that OTP input is limited to 6 digits
      />
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
      <button onClick={handleSubmit}>Submit OTP</button>
    </div>
  );
}
