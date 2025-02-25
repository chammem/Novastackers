import React, { useState } from 'react'
import HeaderMid from '../HeaderMid'
import BreadCrumb from '../BreadCrumb'
function ForgotPassword() {
  const [email,setEmail] = useState("");
  const Submit = () => {
    console.log(email);
  }
  return (
    <>
    <HeaderMid/>
    <BreadCrumb name={"Forget Password"}/>
    <div className="ltn__login-area pb-65">
  <div className="container">
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <div className="section-title-area text-center">
          <h1 className="section-title">Forgot Password</h1>
          <p>Lorem ipsum dolor sit amet consectetur.</p>
        </div>
        <div className="account-login-inner">
          <form className="ltn__form-box contact-form-box">
            <input 
              type="text" 
              name="email" 
              placeholder="Email" 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <div className="btn-wrapper mt-0 text-center">
              <button className="theme-btn-1 btn" type="button" onClick={() => Submit()}>
                FORGOT PASSWORD
              </button>
            </div>
            <div className="go-to-btn mt-20 text-center">
              <a href="#"><small>FORGOTTEN YOUR PASSWORD?</small></a>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>



    
    
    </>
  )
}

export default ForgotPassword