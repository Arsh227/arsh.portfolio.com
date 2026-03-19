import type { Metadata } from "next";
import "./globals.css";
import PortfolioEffects from "@/components/PortfolioEffects";
import FramerRouteTransition from "@/components/FramerRouteTransition";
import GithubIntegration from "@/components/GithubIntegration";

export const metadata: Metadata = {
  title: "Arsh Khandpur",
  description: "3D interactive portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="active" id="top">
        <div className="loading" data-loading>
          <img
            src="/assets/images/loading.png"
            width="300"
            height="300"
            alt="loading"
            className="img"
          />
          <img
            src="/assets/images/loading-circle.svg"
            width="200"
            height="200"
            alt=""
            className="circle"
          />
        </div>

        <header className="header" data-header>
          <div className="container">
            <a href="/" className="logo">
              <img src="/assets/images/logo.png.png" width="70" height="70" alt="Arsh home" />
            </a>

            <button className="nav-open-btn" aria-label="open menu" data-nav-toggler>
              <img src="/assets/images/menu.svg" width="17" height="17" alt="menu icon" />
            </button>

            <nav className="navbar" data-navbar>
              <div className="navbar-top">
                <a href="/" className="logo">
                  <img src="/assets/images/loading1.png" width="140" height="40" alt="Arsh home" className="img" />
                </a>

                <button className="nav-close-btn" aria-label="close menu" data-nav-toggler>
                  <span className="span one"></span>
                  <span className="span two"></span>
                </button>
              </div>

              <ul className="navbar-list">
                <li className="navbar-item">
                  <a href="#home" className="navbar-link" data-nav-link>
                    Home
                  </a>
                </li>
                <li className="navbar-item">
                  <a href="#about" className="navbar-link" data-nav-link>
                    About
                  </a>
                </li>
                <li className="navbar-item">
                  <a href="#service" className="navbar-link" data-nav-link>
                    Services
                  </a>
                </li>
                <li className="navbar-item">
                  <a href="#portfolio" className="navbar-link" data-nav-link>
                    Portfolio
                  </a>
                </li>
                <li className="navbar-item">
                  <a href="#contact" className="navbar-link" data-nav-link>
                    Contact us
                  </a>
                </li>
              </ul>

              <p className="navbar-title">My Email-Address</p>
              <address className="navbar-text">arshkhandpur227@gmail.com</address>

              <p className="navbar-text">
                Contact
                <a href="tel:8085613846" className="contact-link">
                  905-782-8279
                </a>
              </p>
            </nav>

            <div className="overlay" data-nav-toggler data-overlay></div>
          </div>
        </header>

        <FramerRouteTransition>{children}</FramerRouteTransition>

        <PortfolioEffects />
        <GithubIntegration />

        <footer className="footer">
          <div className="footer-top section" id="contact">
            <div className="container">
              <p className="section-subtitle" data-reveal>
                Contact Us
              </p>
              <h2 className="h2 section-title" data-reveal>
                Work inquiry, Job oportunities? Send Message.
              </h2>

              <a href="#" className="btn-icon" data-reveal>
                <img src="/assets/images/arrow-forward.svg" width="43" height="20" loading="lazy" alt="arrow-forward icon" />
              </a>

              <img
                src="/assets/images/footer-1.png"
                width="159"
                height="176"
                loading="lazy"
                alt="photography"
                className="abs-img abs-img-1"
                data-reveal
              />
              <img
                src="/assets/images/footer-2.jpg"
                width="265"
                height="275"
                loading="lazy"
                alt="photography"
                className="abs-img abs-img-2"
                data-reveal
              />
              <img
                src="/assets/images/footer-3.jpg"
                width="303"
                height="272"
                loading="lazy"
                alt="photography"
                className="abs-img abs-img-3"
                data-reveal
              />
              <img
                src="/assets/images/footer-4.png"
                width="175"
                height="175"
                loading="lazy"
                alt="photography"
                className="abs-img abs-img-4"
                data-reveal
              />

              <img
                src="/assets/images/footer-shape.svg"
                width="185"
                height="134"
                loading="lazy"
                alt=""
                className="shape"
              />
            </div>
          </div>

          <div className="footer-bottom">
            <div className="container">
              <a href="/" className="logo">
                <img src="/assets/images/logo.png.png" width="40" height="40" loading="lazy" alt="Arsh home" />
              </a>

              <ul className="social-list">
                <li>
                  <a href="#" className="social-link">
                    Linkdin.
                  </a>
                </li>
                <li>
                  <a href="#" className="social-link">
                    Insta.
                  </a>
                </li>
                <li>
                  <a href="#" className="social-link">
                    Tw.
                  </a>
                </li>
              </ul>

              <p className="copyright">©Arsh Khandpur 2025 </p>
            </div>
          </div>

          <div className="footer-bg has-before">
            <img src="/assets/images/footer-bg.png" width="1920" height="1135" loading="lazy" alt="Game" className="img-cover" />
          </div>
        </footer>

        <a href="#top" className="back-top-btn" aria-label="back to top" data-back-top-btn>
          0%
        </a>

        <div className="cursor" data-cursor></div>
      </body>
    </html>
  );
}

