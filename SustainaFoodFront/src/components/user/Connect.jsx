import React, { useState } from 'react'
import HeaderMid from '../HeaderMid'
import BreadCrumb from '../BreadCrumb'
import { Navigate } from 'react-router';

function Connect() {

    const [password,setPassword] = useState("");
    const [email,setEmail] = useState("");
    const Submit = () => {
        console.log(password,email);

    }

  return (
    <>
    <HeaderMid/>
    <BreadCrumb name={"login"}/>
   <div className="ltn__login-area pb-65">
  <div className="container">
    <div className="row">
      <div className="col-lg-12">
        <div className="section-title-area text-center">
          <h1 className="section-title">Sign In <br />To  Your Account</h1>
          <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. <br />
            Sit aliquid,  Non distinctio vel iste.</p>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-lg-6">
        <div className="account-login-inner">
          <form action="#" className="ltn__form-box contact-form-box">
            <input type="text" name="email" placeholder="Email" onChange={ (e) => {setEmail(e.target.value)}} />
            <input type="password" name="password" placeholder="Password" onChange={(e)=> {setPassword(e.target.value) }}/>
            <div className="btn-wrapper mt-0">
              <button className="theme-btn-1 btn " type="button" onClick={()=>Submit()}>SIGN IN</button>
            </div>
            <div className="go-to-btn mt-20">
              <a href="#" onClick={()=>NavigatetoOtp()}><small>FORGOTTEN YOUR PASSWORD?</small></a>
            </div>
          </form>
        </div>
      </div>
      <div className="col-lg-6">
        <div className="account-create text-center pt-50">
          <h4>DON'T HAVE AN ACCOUNT?</h4>
          <p>Add items to your wishlistget personalised recommendations <br />
            check out more quickly track your orders register</p>
          <div className="btn-wrapper">
            <a href="register.html" className="theme-btn-1 btn black-btn">CREATE ACCOUNT</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

    
    
    </>
  )
}

export default Connect