import { useContext } from "react";
import { PageContext } from "../App"; // Assure-toi d'importer ton PageContext

function Home() {
  const { setPage } = useContext(PageContext);

  return (
    <>
      <HeaderTop />
      <HeaderMid />
      <Hero />
      <div className="ltn__feature-area mt-100 mt--65">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="ltn__feature-item-box-wrap ltn__feature-item-box-wrap-2 ltn__border section-bg-6">
                <div className="ltn__feature-item ltn__feature-item-8">
                  <div className="ltn__feature-icon">
                    <img src="broccoli/img/icons/svg/8-trolley.svg" alt="" />
                  </div>
                  <div className="ltn__feature-info">
                    <h4>Shipping</h4>
                    <p></p>
                  </div>
                </div>
                <div className="ltn__feature-item ltn__feature-item-8">
                  <div className="ltn__feature-icon">
                    <img src="broccoli/img/icons/svg/9-money.svg" alt="" />
                  </div>
                  <div className="ltn__feature-info">
                    <h4>Save Money</h4>
                    <p></p>
                  </div>
                </div>
                <div className="ltn__feature-item ltn__feature-item-8">
                  <div className="ltn__feature-icon">
                    <img src="broccoli/img/icons/svg/10-credit-card.svg" alt="" />
                  </div>
                  <div className="ltn__feature-info">
                    <h4>Secure checkout</h4>
                    <p></p>
                  </div>
                </div>
                <div className="ltn__feature-item ltn__feature-item-8">
                  <div className="ltn__feature-icon">
                    <img src="broccoli/img/icons/svg/11-gift-card.svg" alt="" />
                  </div>
                  <div className="ltn__feature-info">
                    <h4>Random baskets</h4>
                    <p></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TopCategories />

      {/* Exemple d'ajout de bouton pour changer de page */}
      <div className="container">
        <button onClick={() => setPage("register")}>S'inscrire</button>
        <button onClick={() => setPage("connect")}>Se connecter</button>
      </div>

      <Footer />
    </>
  );
}

export default Home;
