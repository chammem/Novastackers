import React from 'react'
import HeaderTop from './HeaderTop'
import Footer from './Footer'
import HeaderMid from './HeaderMid'

function Error404() {
  return (
    <>
    
    <HeaderMid/>
    <div className="ltn__404-area ltn__404-area-1 mb-120">
  <div className="container">
    <div className="row">
      <div className="col-lg-12">
        <div className="error-404-inner text-center">
          <h1 className="error-404-title">404</h1>
          <h2>Page Not Found! Page Not Found!</h2>
          {/* <h3>Oops! Looks like something going rong</h3> */}
          <p>Oops! The page you are looking for does not exist. It might have been moved or deleted.</p>
          <div className="btn-wrapper">
            <a href="index.html" className="btn btn-transparent"><i className="fas fa-long-arrow-alt-left" /> BACK TO HOME</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<Footer/>
    </>
  )
}

export default Error404