import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import axiosInstance from '../config/axiosInstance';
import { useEffect, useState } from 'react';

function HeaderMid() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Define navigate

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosInstance.get("/user-details");
        setUser(response.data.data);
         
      // Update state with user details
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      console.log("Attempting to log out...");
      const response = await axiosInstance.post("/userLogout");
      console.log("Logout response:", response.data);
  
      setUser(null); // Clear user state
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="ltn__header-middle-area ltn__header-sticky ltn__sticky-bg-white ltn__logo-right-menu-option plr--9---">
      <div className="container">
        <div className="row">
          <div className="col">
            <div className="site-logo-wrap">
              <div className="site-logo">
                <Link to="/">
                  <img src="broccoli/img/logo.png" alt="Logo" />
                </Link>
              </div>
            </div>
          </div>
          <div className="col header-menu-column menu-color-white---">
            <div className="header-menu d-none d-xl-block">
              <nav>
                <div className="ltn__main-menu">
                  <ul>
                    <li>
                      <Link to="/">Home</Link>
                    </li>
                    {user ? (
                      <li>
                        <p>Welcome, {user.fullName}!</p>
                      </li>
                    ) : (
                      <li>Loading user details...</li>
                    )}
                    <li>
                      <a href="#">About</a>
                      <ul>
                        <li>
                          <a href="">Services</a>
                        </li>
                        <li>
                          <a href="">Service Details</a>
                        </li>
                        <li>
                          <a href="">Gallery</a>
                        </li>
                        <li>
                          <a href="">Gallery - 02</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="#">Shop</a>
                      <ul>
                        <li>
                          <a href="">Shop</a>
                        </li>
                        <li>
                          <a href="">Shop Grid</a>
                        </li>
                        <li>
                          <a href="">Shop Left sidebar</a>
                        </li>
                        <li>
                          <a href="">Shop right sidebar</a>
                        </li>
                        <li>
                          <a href="">Shop details </a>
                        </li>
                        <li>
                          <a href="">Shop details no sidebar </a>
                        </li>
                        <li>
                          <a href="#">
                            Other Pages <span className="float-end">&gt;&gt;</span>
                          </a>
                          <ul>
                            <li>
                              <a href="">Cart</a>
                            </li>
                            <li>
                              <a href="">Wishlist</a>
                            </li>
                            <li>
                              <a href="">Checkout</a>
                            </li>
                            <li>
                              <a href="">Order Tracking</a>
                            </li>
                            <li>
                              <a href="">My Account</a>
                            </li>
                            <li>
                              <a href="">Sign in</a>
                            </li>
                            <li>
                              <a href="">Register</a>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="#">Pages</a>
                      <ul className="mega-menu">
                        <li>
                          <a href="#">Inner Pages</a>
                          <ul>
                            <li>
                              <a href="">Gallery</a>
                            </li>
                            <li>
                              <a href="">Gallery - 02</a>
                            </li>
                            <li>
                              <a href="">Gallery Details</a>
                            </li>
                            <li>
                              <a href="">Team</a>
                            </li>
                            <li>
                              <a href="">Team Details</a>
                            </li>
                            <li>
                              <a href="">FAQ</a>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <a href="#">Inner Pages</a>
                          <ul>
                            <li>
                              <a href="">History</a>
                            </li>
                            <li>
                              <a href="l">Appointment</a>
                            </li>
                            <li>
                              <a href="">Google Map Locations</a>
                            </li>
                            <li>
                              <a href="">404</a>
                            </li>
                            <li>
                              <a href="">Contact</a>
                            </li>
                            <li>
                              <a href="">Coming Soon</a>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <a href="#">Shop Pages</a>
                          <ul>
                            <li>
                              <a href="">Shop</a>
                            </li>
                            <li>
                              <a href="">Shop Left sidebar</a>
                            </li>
                            <li>
                              <a href="">Shop right sidebar</a>
                            </li>
                            <li>
                              <a href="">Shop Grid</a>
                            </li>
                            <li>
                              <a href="">Shop details </a>
                            </li>
                            <li>
                              <a href="">Cart</a>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <a href="">
                            <img src="broccoli/img/banner/menu-banner-1.png" alt="#" />
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="">Contact</a>
                    </li>
                    <li className="special-link">
                      <Link to="/role">Join Us Now</Link>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
          <div className="ltn__header-options ltn__header-options-2 mb-sm-20">
            {/* header-search-1 */}
            <div className="header-search-wrap">
              <div className="header-search-1">
                <div className="search-icon">
                  <i className="icon-search for-search-show" />
                  <i className="icon-cancel  for-search-close" />
                </div>
              </div>
              <div className="header-search-1-form">
                <form id="#" method="get" action="#">
                  <input type="text" name="search" defaultValue placeholder="Search here..." />
                  <button type="submit">
                    <span>
                      <i className="icon-search" />
                    </span>
                  </button>
                </form>
              </div>
            </div>
            {/* user-menu */}
            <div className="ltn__drop-menu user-menu">
              <ul>
                <li>
                  <a href="#">
                    <i className="icon-user" />
                  </a>
                  <ul>
                    <li>
                      <Link to="/Login">Sign in</Link>
                    </li>
                    <li>
                      <Link to="/role">Register</Link>
                    </li>
                    {user && (
                      <>
                      <li>
                        <Link  to="/userProfile" style={{ cursor: "pointer" }}>
                          Profile
                          </Link>
                      </li>
                      <li>
                        <a href="" onClick={handleLogout} style={{ cursor: "pointer" }}>
                          Logout
                        </a>
                      </li>
                      </>
                    )}
                  </ul>
                </li>
              </ul>
            </div>
            {/* mini-cart */}
            <div className="mini-cart-icon">
              <a href="#ltn__utilize-cart-menu" className="ltn__utilize-toggle">
                <i className="icon-shopping-cart" />
                <sup>2</sup>
              </a>
            </div>
            {/* mini-cart */}
            {/* Mobile Menu Button */}
            <div className="mobile-menu-toggle d-xl-none">
              <a href="#ltn__utilize-mobile-menu" className="ltn__utilize-toggle">
                <svg viewBox="0 0 800 600">
                  <path
                    d="M300,220 C300,220 520,220 540,220 C740,220 640,540 520,420 C440,340 300,200 300,200"
                    id="top"
                  />
                  <path d="M300,320 L540,320" id="middle" />
                  <path
                    d="M300,210 C300,210 520,210 540,210 C740,210 640,530 520,410 C440,330 300,190 300,190"
                    id="bottom"
                    transform="translate(480, 320) scale(1, -1) translate(-480, -318) "
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderMid;