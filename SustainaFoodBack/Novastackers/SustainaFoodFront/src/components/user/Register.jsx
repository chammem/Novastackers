import React, { useState } from 'react'
import HeaderMid from '../HeaderMid'
import BreadCrumb from '../BreadCrumb'
import { Outlet } from 'react-router-dom';

function Register() {
    const [firstName,setFirstName] = useState("");
    const [lastName,setlastName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [confirmPassword,setConfirmPassword] = useState("");
    const RegisterUser = () => {
        console.log(firstName,lastName,email,password,confirmPassword);
    }
  return (
    <>
    <HeaderMid/>
    <BreadCrumb name={"register"}/>
  
  
<Outlet/>
    </>
  )
}

export default Register