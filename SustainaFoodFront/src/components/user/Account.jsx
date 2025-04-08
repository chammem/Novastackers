import React from 'react'
import HeaderMid from '../HeaderMid'
import BreadCrumb from '../BreadCrumb'
// import TabArea from './TabArea'
function Account() {
  return (
   <>
    <HeaderMid/>
    <BreadCrumb name={"My Account"}/>
    <TabArea/>
   </>
  )
}

export default Account