import React from 'react'

function TopCategories() {
  return (
   <div className="ltn__about-us-area pt-120 pb-120">
  <div className="container">
    <div className="row">
      <div className="col-lg-6 align-self-center">
        <div className="about-us-img-wrap about-img-left">
          <img src="broccoli/img/others/6.png" alt="About Us Image" />
        </div>
      </div>
      <div className="col-lg-6 align-self-center">
        <div className="about-us-info-wrap">
          <div className="section-title-area ltn__section-title-2">
            <h6 className="section-subtitle ltn__secondary-color">Know More About Shop</h6>
            <h1 className="section-title">Trusted Organic <br className="d-none d-md-block" />  Food  Store</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore</p>
          </div>
          <p>sellers who aspire to be good, do good, and spread goodness. We
            democratic, self-sustaining, two-sided marketplace which thrives
            on trust and is built on community and quality content.</p>
          <div className="about-author-info d-flex">
            <div className="author-name-designation  align-self-center mr-30">
              <h4 className="mb-0">Jerry Henson</h4>
              <small>/ Shop Director</small>
            </div>
            <div className="author-sign  align-self-center">
              <img src="broccoli/img/icons/icon-img/author-sign.png" alt="#" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


  )
}

export default TopCategories