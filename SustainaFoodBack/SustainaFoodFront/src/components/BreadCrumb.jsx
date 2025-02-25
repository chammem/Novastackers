import React from 'react'
import { Link } from 'react-router-dom'
function BreadCrumb({name}) {
  return (
   <div className="ltn__breadcrumb-area ltn__breadcrumb-area-2 ltn__breadcrumb-color-white bg-overlay-theme-black-90 bg-image" data-bg="broccoli/img/bg/9.jpg">
  <div className="container">
    <div className="row">
      <div className="col-lg-12">
        <div className="ltn__breadcrumb-inner ltn__breadcrumb-inner-2 justify-content-between">
          <div className="section-title-area ltn__section-title-2">
            <h6 className="section-subtitle ltn__secondary-color">Welcome to our company</h6>
            <h1 className="section-title white-color">{name}</h1>
          </div>
          <div className="ltn__breadcrumb-list">
            <ul>
              <li><Link to="/" href="index.html">Home</Link></li>
              <li>{name}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  )
}

export default BreadCrumb