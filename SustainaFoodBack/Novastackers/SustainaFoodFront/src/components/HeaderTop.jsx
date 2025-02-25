import React from 'react'

function HeaderTop() {
  return (
    <header className="ltn__header-area ltn__header-5 ltn__header-transparent-- gradient-color-4---">
      {/* ltn__header-top-area start */}
      <div className="ltn__header-top-area">
        <div className="container">
          <div className="row">
            {/* Left Side */}
            <div className="col-md-7">
              <div className="ltn__top-bar-menu">
                <ul>
                  <li>
                    <a href="locations.html">
                      <i className="icon-placeholder"></i> 15/A, Nest Tower, NYC
                    </a>
                  </li>
                  <li>
                    <a href="mailto:info@webmail.com?Subject=Flower%20greetings%20to%20you">
                      <i className="icon-mail"></i> info@webmail.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Side */}
            <div className="col-md-5">
              <div className="top-bar-right text-right text-end">
                <div className="ltn__top-bar-menu">
                  <ul>
                    <li>
                      {/* Language Menu */}
                      <div className="ltn__drop-menu ltn__currency-menu ltn__language-menu">
                        <ul>
                          <li>
                            <a href="#" className="dropdown-toggle">
                              <span className="active-currency">English</span>
                            </a>
                            <ul>
                              {["Arabic", "Bengali", "Chinese", "English", "French", "Hindi"].map(
                                (lang, index) => (
                                  <li key={index}>
                                    <a href="#">{lang}</a>
                                  </li>
                                )
                              )}
                            </ul>
                          </li>
                        </ul>
                      </div>
                    </li>

                    {/* Social Media Icons */}
                    <li>
                      <div className="ltn__social-media">
                        <ul>
                          {[
                            { platform: "Facebook", icon: "fab fa-facebook-f" },
                            { platform: "Twitter", icon: "fab fa-twitter" },
                            { platform: "Instagram", icon: "fab fa-instagram" },
                            { platform: "Dribbble", icon: "fab fa-dribbble" },
                          ].map((social, index) => (
                            <li key={index}>
                              <a href="#" title={social.platform}>
                                <i className={social.icon}></i>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderTop;