import { useState } from "react";

export default function OTPInput({ OTP, setPage }) { // ✅ Passer OTP et setPage en props
  const [userInput, setUserInput] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (parseInt(userInput) === parseInt(OTP)) { // ✅ Convertir en entier pour éviter les erreurs
      alert("OTP correct, proceed to reset password.");
      setPage("reset-password");
    } else {
      setError("Invalid OTP. Please try again.");
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
        maxLength={6}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleSubmit}>Submit OTP</button>
    </div>
  );
}
