import React from 'react'
import { Link } from 'react-router-dom'

function Hero() {
  return (
    <div className="ltn__slider-area ltn__slider-3 section-bg-1">
      <div className="container">
        <div className="row align-items-center">
          {/* First Section: Text & Image */}
          <div className="col-lg-6">
            <div className="slide-item-info">
              <div className="slide-item-info-inner">
                <h6 className="slide-sub-title">
                  <img src="broccoli/img/icons/icon-img/1.png" alt="icon" /> 100% Genuine Products
                </h6>
                <h1 className="slide-title">
                  Our Garden's Most <br /> Favorite Food
                </h1>
                <div className="slide-brief">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore.
                  </p>
                </div>
                <div className="btn-wrapper">
                  <Link to="/role" href="shop.html" className="theme-btn-1 btn btn-effect-1 text-uppercase">
                    Join Us Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 text-center">
            <img src="broccoli/img/slider/21.png" alt="Garden Food" className="img-fluid" />
          </div>
        </div>

        <div className="row align-items-center mt-5">
          {/* Second Section: Text & Image */}
         

         
        </div>
      </div>
    </div>
  )
}

export default Hero