import React, { useState } from 'react'
import HeaderTop from '../HeaderTop'
import HeaderMid from '../HeaderMid'
import Footer from '../Footer'
import BreadCrumb from '../BreadCrumb'
import { useNavigate } from "react-router-dom";
function RoleChoice() {
    const [role,setRole] = useState("");
    const navigate = useNavigate();
    const handleSubmit = () => {
        if(role === ""){return}
        navigate(`/register/${role}`);
    }
  
  
   return (
    <>
    <HeaderMid/>
    <BreadCrumb name={"Select You Role"}/>
    <div className="ltn__login-area pb-65">
  <div className="container">
    <div className="row">
      <div className="col-lg-12">
        <div className="section-title-area text-center">
          <h1 className="section-title">Select Your Role <br /></h1>
          <p></p>
        </div>
      </div>
    </div>
    <div className="row justify-content-center">
      <div className="col-lg-6 d-flex flex-column align-items-center">
        <div className="account-login-inner w-100">
          <form action="#" className="ltn__form-box contact-form-box d-flex flex-column align-items-center">
            <div className="input-item w-100 text-center">
              <select className="nice-select w-100" onChange={(e)=> {setRole(e.target.value);console.log()}}>
                <option>----</option>
                <option>restaurant</option>
                <option>supermarket</option>
                <option>driver</option>
                <option>regularUser</option>
              </select>
            </div>
            <div className="btn-wrapper mt-3 w-100 text-center">
              <button className="theme-btn-1 btn w-100" type="button" onClick={()=> handleSubmit()}>Select Role</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
<Footer/>
    </>
  )
}

export default RoleChoice