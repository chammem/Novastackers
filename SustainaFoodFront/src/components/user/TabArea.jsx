import React, { useState } from 'react'

function TabArea() {
    const [activeTab,setActiveTab] = useState("tab2");
    const Logout = () => {
        
    }
  return (
   <>
   <div className="liton__wishlist-area pb-70">
  <div className="container">
    <div className="row">
      <div className="col-lg-12">
        {/* PRODUCT TAB AREA START */}
        <div className="ltn__product-tab-area">
          <div className="container">
            <div className="row">
              <div className="col-lg-4">
                <div className="ltn__tab-menu-list mb-50">
                  <div className="nav">
                    <a  className={`${activeTab === "tab1" ? "active show" : ""} `} onClick={()=>{setActiveTab("tab1");console.log("tab1")}} data-bs-toggle="tab" href="#liton_tab_1_2" >Account Details<i className="fas fa-user" /></a>
                    <a  className={`${activeTab === "tab2" ? "active show" : ""} `} onClick={()=>{setActiveTab("tab2");console.log("tab1")}} data-bs-toggle="tab" href="#liton_tab_1_2">Orders <i className="fas fa-file-alt" /></a>
                
                    <a className={`${activeTab === "tab3" ? "active show" : ""} `} onClick={()=>{setActiveTab("tab3");console.log("tab1")}} data-bs-toggle="tab" href="#liton_tab_1_4">address <i className="fas fa-map-marker-alt" /></a>
                    
                    <a  onClick={()=>Logout()} href="">Logout <i className="fas fa-sign-out-alt" /></a>
                  </div>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="tab-content">
                  <div className={`${activeTab === "tab4" ? "tab-pane fade active show" : "tab-pane fade"} `}id="liton_tab_1_1"> 
                    <div className="ltn__myaccount-tab-content-inner">
                      <p>Hello <strong>UserName</strong> (not <strong>UserName</strong>? <small><a href="login-register.html">Log out</a></small> )</p>
                      <p>From your account dashboard you can view your <span>recent orders</span>, manage your <span>shipping and billing addresses</span>, and <span>edit your password and account details</span>.</p>
                    </div>
                  </div>
                  <div className={`${activeTab === "tab2" ? "tab-pane fade active show" : "tab-pane fade"} `} id="liton_tab_1_2">
                    <div className="ltn__myaccount-tab-content-inner">
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Order</th>
                              <th>Date</th>
                              <th>Status</th>
                              <th>Total</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>1</td>
                              <td>Jun 22, 2019</td>
                              <td>Pending</td>
                              <td>$3000</td>
                              <td><a href="cart.html">View</a></td>
                            </tr>
                            <tr>
                              <td>2</td>
                              <td>Nov 22, 2019</td>
                              <td>Approved</td>
                              <td>$200</td>
                              <td><a href="cart.html">View</a></td>
                            </tr>
                            <tr>
                              <td>3</td>
                              <td>Jan 12, 2020</td>
                              <td>On Hold</td>
                              <td>$990</td>
                              <td><a href="cart.html">View</a></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                 
                  <div className={`${activeTab === "tab3" ? "tab-pane fade active show" : "tab-pane fade"} `} id="liton_tab_1_4">
                    <div className="ltn__myaccount-tab-content-inner">
                      <p>The following addresses will be used on the checkout page by default.</p>
                      <div className="row">
                        <div className="col-md-6 col-12 learts-mb-30">
                          <h4>Billing Address <small><a href="#">edit</a></small></h4>
                          <address>
                            <p><strong>Alex Tuntuni</strong></p>
                            <p>1355 Market St, Suite 900 <br />
                              San Francisco, CA 94103</p>
                            <p>Mobile: (123) 456-7890</p>
                          </address>
                        </div>
                        <div className="col-md-6 col-12 learts-mb-30">
                          <h4>Shipping Address <small><a href="#">edit</a></small></h4>
                          <address>
                            <p><strong>Alex Tuntuni</strong></p>
                            <p>1355 Market St, Suite 900 <br />
                              San Francisco, CA 94103</p>
                            <p>Mobile: (123) 456-7890</p>
                          </address>
                        </div>
                      </div>
                    </div>
                  </div>

                  
                  <div className={`${activeTab === "tab1" ? "tab-pane fade active show" : "tab-pane fade"} `}id="liton_tab_1_5">
                    <div className="ltn__myaccount-tab-content-inner">
                      <p>The following addresses will be used on the checkout page by default.</p>
                      <div className="ltn__form-box">
                        <form action="#">
                          <div className="row mb-50">
                            <div className="col-md-6">
                              <label>First name:</label>
                              <input type="text" name="ltn__name" />
                            </div>
                            <div className="col-md-6">
                              <label>Last name:</label>
                              <input type="text" name="ltn__lastname" />
                            </div>
                            <div className="col-md-6">
                              <label>Display Name:</label>
                              <input type="text" name="ltn__lastname" placeholder="Ethan" />
                            </div>
                            <div className="col-md-6">
                              <label>Display Email:</label>
                              <input type="email" name="ltn__lastname" placeholder="example@example.com" />
                            </div>
                          </div>
                          <fieldset>
                            <legend>Password change</legend>
                            <div className="row">
                              <div className="col-md-12">
                                <label>Current password (leave blank to leave unchanged):</label>
                                <input type="password" name="ltn__name" />
                                <label>New password (leave blank to leave unchanged):</label>
                                <input type="password" name="ltn__lastname" />
                                <label>Confirm new password:</label>
                                <input type="password" name="ltn__lastname" />
                              </div>
                            </div>
                          </fieldset>
                          <div className="btn-wrapper">
                            <button type="submit" className="btn theme-btn-1 btn-effect-1 text-uppercase">Save Changes</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* PRODUCT TAB AREA END */}
      </div>
    </div>
  </div>
</div>

   </>
  )
}

export default TabArea