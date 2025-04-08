import React, { useState } from "react";
import EnterEmail from "./EnterEmail";
import EnterOtp from "./EnterOtp";
import ResetPassword from "./ResetPassword";

const ForgotPasswordFlow = () => {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP, 3 = Reset
  const [email, setEmail] = useState(""); // Store user email
  const [otpVerified, setOtpVerified] = useState(false); // OTP Verification status

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {step === 1 && <EnterEmail onNext={(email) => { setEmail(email); setStep(2); }} />}
      {step === 2 && <EnterOtp email={email} onVerify={() => { setOtpVerified(true); setStep(3); }} />}
      {step === 3 && otpVerified && <ResetPassword email={email} />}
    </div>
  );
};

export default ForgotPasswordFlow;
