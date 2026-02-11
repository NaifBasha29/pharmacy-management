import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
    FaPills, FaClipboardList, FaUserMd, FaChartLine,
    FaShieldAlt, FaHeadset, FaCheckCircle, FaMapMarkerAlt,
    FaPhone, FaEnvelope, FaClock, FaArrowRight
} from 'react-icons/fa';
import './LandingPage.css';
import landingImage from '../../assets/lp.png';
import phamLogo from '../../assets/phamlogo.png';

const LandingPage = () => {
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleContactChange = (e) => {
        setContactForm({
            ...contactForm,
            [e.target.name]: e.target.value
        });
    };

    const [activeSection, setActiveSection] = useState('home');

    const handleContactSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for contacting us! We will get back to you shortly.');
        setContactForm({ name: '', email: '', message: '' });
    };

    React.useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'features', 'about', 'contact'];
            const scrollPosition = window.scrollY + 200; // Offset for header

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const offsetTop = element.offsetTop;
                    const offsetHeight = element.offsetHeight;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section);
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <Link to="/" className="nav-brand">
                        <img src={phamLogo} alt="RxHub" className="brand-logo-img" />
                        <span className="brand-name">RxHub</span>
                    </Link>
                    <div className="nav-links">
                        <a href="#home" className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} onClick={() => setActiveSection('home')}>Home</a>
                        <a href="#features" className={`nav-link ${activeSection === 'features' ? 'active' : ''}`} onClick={() => setActiveSection('features')}>Features</a>
                        <a href="#about" className={`nav-link ${activeSection === 'about' ? 'active' : ''}`} onClick={() => setActiveSection('about')}>About</a>
                        <a href="#contact" className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`} onClick={() => setActiveSection('contact')}>Contact</a>
                    </div>
                    <div className="nav-actions">
                        <Link to="/user/login" className="btn-cta">Sign In</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero">
                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="badge-dot"></span>
                            Trusted by 5,000+ Pharmacies
                        </div>
                        <h1 className="hero-title">
                            Next-Gen <span className="gradient-text">Pharmacy</span> Management
                        </h1>
                        <p className="hero-subtitle">
                            Streamline operations, boost efficiency, and deliver exceptional patient care
                            with our all-in-one cloud platform designed for modern pharmacies.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/user/login" className="btn-primary">
                                Sign In
                                <FaArrowRight className="btn-icon" />
                            </Link>
                            <a href="#features" className="btn-secondary">Learn More</a>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-value">99.9%</span>
                                <span className="stat-label">Uptime</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat">
                                <span className="stat-value">10M+</span>
                                <span className="stat-label">Prescriptions</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat">
                                <span className="stat-value">24/7</span>
                                <span className="stat-label">Support</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-image-container">
                            <img src={landingImage} alt="RxHub Dashboard" className="hero-image" />
                        </div>
                        <div className="floating-card card-orders">
                            <div className="card-icon green"><FaCheckCircle /></div>
                            <div className="card-info">
                                <span className="card-title">Orders Processed</span>
                                <span className="card-value">1,234</span>
                            </div>
                        </div>
                        <div className="floating-card card-revenue">
                            <div className="card-icon blue"><FaChartLine /></div>
                            <div className="card-info">
                                <span className="card-title">Revenue Today</span>
                                <span className="card-value">$12,450</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-tag">Features</span>
                        <h2 className="section-title">Everything You Need to Succeed</h2>
                        <p className="section-desc">
                            Powerful tools designed to help you manage inventory, serve patients, and grow your business.
                        </p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon blue">
                                <FaClipboardList />
                            </div>
                            <h3>Smart Inventory</h3>
                            <p>Real-time tracking with automated reordering and expiry alerts.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon green">
                                <FaUserMd />
                            </div>
                            <h3>Patient Profiles</h3>
                            <p>Complete medication history and interaction checks for safer care.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon purple">
                                <FaShieldAlt />
                            </div>
                            <h3>HIPAA Compliant</h3>
                            <p>Bank-level encryption with role-based access controls.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon orange">
                                <FaChartLine />
                            </div>
                            <h3>Analytics Dashboard</h3>
                            <p>Insightful reports on sales, inventory, and financial performance.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon pink">
                                <FaPills />
                            </div>
                            <h3>E-Prescribing</h3>
                            <p>Seamlessly receive and process electronic prescriptions.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon teal">
                                <FaHeadset />
                            </div>
                            <h3>24/7 Support</h3>
                            <p>Dedicated team ready to assist you whenever you need help.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about">
                <div className="section-container">
                    <div className="about-grid">
                        <div className="about-content">
                            <span className="section-tag">About Us</span>
                            <h2 className="section-title left">Empowering Pharmacies Since 2024</h2>
                            <p className="about-text">
                                At RxHub, we understand the daily challenges of running a pharmacy.
                                From managing complex inventories to ensuring patient safety, the demands
                                are high. That's why we built a solution that puts you back in control.
                            </p>
                            <ul className="about-list">
                                <li><FaCheckCircle /> Streamlined daily operations</li>
                                <li><FaCheckCircle /> Reduce medication errors by 90%</li>
                                <li><FaCheckCircle /> Increase profitability and efficiency</li>
                                <li><FaCheckCircle /> Enterprise-grade security</li>
                            </ul>
                            <Link to="/user/login" className="btn-primary">
                                Sign In to Your Account
                                <FaArrowRight className="btn-icon" />
                            </Link>
                        </div>
                        <div className="about-stats">
                            <div className="stat-card">
                                <span className="stat-number">98%</span>
                                <span className="stat-text">Customer Satisfaction</span>
                            </div>
                            <div className="stat-card highlight">
                                <span className="stat-number">24hr</span>
                                <span className="stat-text">Quick Onboarding</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-number">50+</span>
                                <span className="stat-text">Integrations</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-number">5K+</span>
                                <span className="stat-text">Active Users</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-tag">Contact</span>
                        <h2 className="section-title">Get in Touch</h2>
                        <p className="section-desc">
                            Have questions? Our team is ready to help you get started.
                        </p>
                    </div>
                    <div className="contact-grid">
                        <div className="contact-info-cards">
                            <div className="info-card">
                                <div className="info-icon"><FaMapMarkerAlt /></div>
                                <h4>Visit Us</h4>
                                <p>123 Health Tech Blvd<br />Silicon Valley, CA 94025</p>
                            </div>
                            <div className="info-card">
                                <div className="info-icon"><FaPhone /></div>
                                <h4>Call Us</h4>
                                <p>+1 (555) 123-4567</p>
                            </div>
                            <div className="info-card">
                                <div className="info-icon"><FaEnvelope /></div>
                                <h4>Email Us</h4>
                                <p>support@RxHub.com</p>
                            </div>
                            <div className="info-card">
                                <div className="info-icon"><FaClock /></div>
                                <h4>Business Hours</h4>
                                <p>Mon - Fri: 9AM - 6PM</p>
                            </div>
                        </div>
                        <div className="contact-form-card">
                            <form onSubmit={handleContactSubmit} className="contact-form">
                                <h3>Send a Message</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={contactForm.name}
                                            onChange={handleContactChange}
                                            required
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={contactForm.email}
                                            onChange={handleContactChange}
                                            required
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea
                                        name="message"
                                        rows="4"
                                        value={contactForm.message}
                                        onChange={handleContactChange}
                                        required
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn-primary btn-full">
                                    Send Message
                                    <FaArrowRight className="btn-icon" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-main">
                        <div className="footer-brand">
                            <Link to="/" className="nav-brand">
                                <span className="brand-logo-img" style={{ fontSize: '24px', marginRight: '8px' }}>🏥</span>
                                <span className="brand-name">RxHub</span>
                            </Link>
                            <p>Modern pharmacy management for the digital age.</p>
                            <div className="footer-socials">
                                <a href="#"><FaFacebookF /></a>
                                <a href="#"><FaTwitter /></a>
                                <a href="#"><FaInstagram /></a>
                                <a href="#"><FaLinkedinIn /></a>
                            </div>
                        </div>
                        <div className="footer-links-group">
                            <div className="footer-col">
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#">Pricing</a>
                                <a href="#">Integrations</a>
                                <a href="#">API Docs</a>
                            </div>
                            <div className="footer-col">
                                <h4>Company</h4>
                                <a href="#about">About Us</a>
                                <a href="#">Careers</a>
                                <a href="#">Blog</a>
                                <a href="#contact">Contact</a>
                            </div>
                            <div className="footer-col">
                                <h4>Legal</h4>
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms of Service</a>
                                <a href="#">HIPAA Compliance</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} RxHub Solutions. All rights reserved.</p>
                        <div className="staff-portal-link">
                            <Link to="/admin/login">Admin</Link>
                            <span className="divider">|</span>
                            <Link to="/clinic/login">Clinic Staff</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;





