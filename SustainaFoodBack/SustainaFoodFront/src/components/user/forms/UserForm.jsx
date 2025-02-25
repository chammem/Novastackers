import React from 'react'
import { useState } from 'react';
function UserForm() {
        const [firstName,setFirstName] = useState("");
        const [lastName,setlastName] = useState("");
        const [email,setEmail] = useState("");
        const [password,setPassword] = useState("");
        const [confirmPassword,setConfirmPassword] = useState("");
        const [dietaryRestriction,setDietatyRestriction] = useState("");
        const [allergies,setAllergies] = useState("");
        
        const RegisterUser = () => {
           
        }
  return (
    <div className="ltn__login-area pb-110">
  <div className="container">
    <div className="row">
      <div className="col-lg-12">
        <div className="section-title-area text-center">
          <h1 className="section-title">Register <br />Your Account</h1>
          <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. <br />
            Sit aliquid,  Non distinctio vel iste.</p>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-lg-6 offset-lg-3">
        <div className="account-login-inner">
          <form action="#" className="ltn__form-box contact-form-box">
            <input  onChange={(e)=> setFirstName(e.target.value)}  type="text" name="firstname" placeholder="First Name" />
            <input  onChange={(e)=> setLastName(e.target.value)} type="text" name="lastname" placeholder="Last Name" />
            <input  onChange={(e)=> setEmail(e.target.value)} type="text" name="email" placeholder="Email" />
            <input  onChange={(e)=> setPassword(e.target.value)} type="password" name="password" placeholder="Password" />
            <input  onChange={(e)=> setConfirmPassword(e.target.value)} type="password" name="confirmpassword" placeholder="Confirm Password" />
            <input  onChange={(e)=> setDietatyRestriction(e.target.value)} type="password" name="confirmpassword" placeholder="Dietary Restriction" />
            <input  onChange={(e)=> setAllergies(e.target.value)} type="password" name="confirmpassword" placeholder="Allergies" />
            <label className="checkbox-inline">
              <input type="checkbox" defaultValue />
              I consent to Herboil processing my personal data in order to send personalized marketing material in accordance with the consent form and the privacy policy.
            </label>
            <label className="checkbox-inline">
              <input type="checkbox" defaultValue />
              By clicking "create account", I consent to the privacy policy.
            </label>
            <div className="btn-wrapper">
              <button className="theme-btn-1 btn reverse-color btn-block" type="submit" onClick={()=>RegisterUser()} >CREATE ACCOUNT</button>
            </div>
          </form>
          <div className="by-agree text-center">
            <p>By creating an account, you agree to our:</p>
            <p><a href="#">TERMS OF CONDITIONS  &nbsp; &nbsp; | &nbsp; &nbsp;  PRIVACY POLICY</a></p>
            <div className="go-to-btn mt-50">
              <a href="login.html">ALREADY HAVE AN ACCOUNT ?</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  )
}

export default UserForm