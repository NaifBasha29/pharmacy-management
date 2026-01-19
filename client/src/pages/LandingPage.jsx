import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import './LandingPage.css';

// Import the landing page image
import landingImage from '../assets/landing-page.png';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-brand">
                    <span className="brand-icon">💊</span>
                    <span className="brand-name">PharmaCare</span>
                </div>
                <div className="nav-links">
                    <a href="#home" className="nav-link active">Home</a>
                    <a href="#products" className="nav-link">Products</a>
                    <a href="#services" className="nav-link">Services</a>
                    <a href="#about" className="nav-link">About Us</a>
                </div>
                <div className="nav-actions">
                    <Link to="/login" className="nav-login-btn">Login</Link>
                </div>
            </nav>

            {/* Hero Section with Image */}
            <section className="hero-section">
                <img
                    src={landingImage}
                    alt="Find any medicine you need"
                    className="hero-image"
                />

                {/* Overlay content on the left */}
                <div className="hero-overlay">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Find any<br />
                            medicine<br />
                            you need.
                        </h1>
                        <p className="hero-description">
                            Your trusted online pharmacy for all your healthcare needs.
                            Browse our extensive catalog of medicines and health products.
                        </p>
                        <Link to="/login" className="shop-now-btn">
                            GET STARTED
                        </Link>
                        <div className="social-icons">
                            <a href="#" className="social-icon"><FaFacebookF /></a>
                            <a href="#" className="social-icon"><FaTwitter /></a>
                            <a href="#" className="social-icon"><FaInstagram /></a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
