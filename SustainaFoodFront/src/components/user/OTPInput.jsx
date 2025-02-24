import React, { useState, useContext } from "react";
import { RecoveryContext } from "../App"; // Vous importez le contexte où l'OTP est stocké

export default function OTPInput() {
  const { OTP, setPage } = useContext(RecoveryContext);
  const [userInput, setUserInput] = useState("");

  function handleSubmit() {
    if (parseInt(userInput) === OTP) {
      alert("OTP correct, proceed to reset password.");
      setPage("reset-password"); // Par exemple, pour passer à la page de réinitialisation
    } else {
      alert("Invalid OTP. Please try again.");
    }
  }

  return (
    <div>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Enter OTP"
      />
      <button onClick={handleSubmit}>Submit OTP</button>
    </div>
  );
}
