import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
    FaPills, FaClipboardList, FaUserMd, FaChartLine,
    FaShieldAlt, FaHeadset, FaCheckCircle, FaMapMarkerAlt,
    FaPhone, FaEnvelope, FaClock, FaArrowRight, FaStar,
    FaBell, FaBoxes, FaLock, FaRocket, FaMobile
} from 'react-icons/fa';
import { FiZap, FiTrendingUp, FiUsers, FiPackage, FiShield, FiPhone } from 'react-icons/fi';
import './LandingPage.css';
import landingImage from '../../assets/lp.png';
import logo from '../../assets/logo.png';

const LandingPage = () => {
    const [activeSection, setActiveSection] = useState('home');
    const [scrolled, setScrolled] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            const sections = ['home', 'features', 'about', 'contact'];
            const scrollPos = window.scrollY + 160;
            for (const s of sections) {
                const el = document.getElementById(s);
                if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
                    setActiveSection(s);
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleContactChange = (e) => setContactForm({ ...contactForm, [e.target.name]: e.target.value });
    const handleContactSubmit = (e) => {
        e.preventDefault();
        alert('Thank you! We will get back to you shortly.');
        setContactForm({ name: '', email: '', message: '' });
    };

    const features = [
        { icon: <FiPackage />, color: 'cyan', title: 'Smart Inventory', desc: 'Real-time stock tracking, automated reordering triggers, and expiry date alerts — all in one place.', tag: 'Popular', size: 'large' },
        { icon: <FiUsers />, color: 'violet', title: 'Patient Profiles', desc: 'Full medication history, interaction checks, and care notes for safer prescribing.', size: 'small' },
        { icon: <FiShield />, color: 'emerald', title: 'HIPAA Compliant', desc: 'Bank-grade encryption and role-based access controls.', size: 'small' },
        { icon: <FiTrendingUp />, color: 'orange', title: 'Analytics', desc: 'Live sales dashboards, inventory turnover reports, and financial insights — automatically generated.', tag: 'New', size: 'large' },
        { icon: <FiZap />, color: 'gold', title: 'E-Prescribing', desc: 'Receive and process electronic prescriptions instantly.', size: 'small' },
        { icon: <FiPhone />, color: 'rose', title: '24/7 Support', desc: 'Our team is always on standby to help you succeed.', size: 'small' },
    ];

    const testimonials = [
        { name: 'Dr. Sarah Chen', role: 'Chief Pharmacist, MedPlus', text: 'PharmaCare reduced our dispensing errors by 87% in the first month. The analytics alone were worth switching.' },
        { name: 'Marcus Williams', role: 'Owner, Williams Pharmacy', text: 'Setup was done in under 24 hours. The inventory automation has saved us thousands every quarter.' },
        { name: 'Priya Sharma', role: 'Operations Lead, HealthHub', text: 'The patient profiles feature is remarkable. Our staff resolved care questions 3x faster.' },
    ];

    return (
        <div className="lp">
            {/* ── NAV ── */}
            <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
                <div className="lp-nav__inner">
                    <Link to="/" className="lp-nav__brand">
                        <img src={logo} alt="Pharma Care" className="lp-nav__logo" />
                        <span className="lp-nav__name">PharmaCare</span>
                    </Link>
                    <div className="lp-nav__links">
                        {['home','features','about','contact'].map(s => (
                            <a key={s} href={`#${s}`} className={`lp-nav__link ${activeSection === s ? 'lp-nav__link--active' : ''}`}
                               onClick={() => setActiveSection(s)}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </a>
                        ))}
                    </div>
                    <div className="lp-nav__actions">
                        <Link to="/user/login" className="lp-btn lp-btn--ghost lp-btn--sm">Sign in</Link>
                        <Link to="/user/login" className="lp-btn lp-btn--primary lp-btn--sm">Get Started <FaArrowRight /></Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section id="home" className="lp-hero">
                <div className="lp-hero__glow lp-hero__glow--1" />
                <div className="lp-hero__glow lp-hero__glow--2" />
                <div className="lp-hero__glow lp-hero__glow--3" />

                <div className="lp-hero__inner">
                    <div className="lp-hero__pill">
                        <span className="lp-pill__dot" />
                        Trusted by 5,000+ pharmacies worldwide
                    </div>

                    <h1 className="lp-hero__title">
                        The smarter way to<br />
                        <span className="lp-text--gradient">run your pharmacy</span>
                    </h1>

                    <p className="lp-hero__sub">
                        Automate inventory, serve patients faster, and grow your business — with the only pharmacy platform built for the modern age.
                    </p>

                    <div className="lp-hero__ctas">
                        <Link to="/user/login" className="lp-btn lp-btn--primary lp-btn--lg">
                            Start for free <FaArrowRight />
                        </Link>
                        <a href="#features" className="lp-btn lp-btn--outline lp-btn--lg">
                            See how it works
                        </a>
                    </div>

                    <div className="lp-hero__trust">
                        <div className="lp-trust__stars">
                            {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                        </div>
                        <span className="lp-trust__text"><strong>4.9/5</strong> from 2,400+ reviews</span>
                    </div>

                    {/* Dashboard mockup */}
                    <div className="lp-hero__mockup">
                        <div className="lp-mockup__browser">
                            <div className="lp-mockup__bar">
                                <span /><span /><span />
                                <div className="lp-mockup__url">app.pharmacare.io/dashboard</div>
                            </div>
                            <img src={landingImage} alt="PharmaCare Dashboard" className="lp-mockup__img" />
                        </div>

                        <div className="lp-float lp-float--orders">
                            <div className="lp-float__icon lp-float__icon--green"><FaCheckCircle /></div>
                            <div>
                                <div className="lp-float__label">Orders today</div>
                                <div className="lp-float__val">1,234</div>
                            </div>
                            <div className="lp-float__badge">+12%</div>
                        </div>

                        <div className="lp-float lp-float--revenue">
                            <div className="lp-float__icon lp-float__icon--violet"><FaChartLine /></div>
                            <div>
                                <div className="lp-float__label">Revenue today</div>
                                <div className="lp-float__val">$12,450</div>
                            </div>
                        </div>

                        <div className="lp-float lp-float--alert">
                            <div className="lp-float__icon lp-float__icon--orange"><FaBell /></div>
                            <div>
                                <div className="lp-float__label">Stock alert</div>
                                <div className="lp-float__val lp-float__val--sm">Amoxicillin low</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── LOGOS / SOCIAL PROOF ── */}
            <section className="lp-logos">
                <div className="lp-logos__inner">
                    <p className="lp-logos__label">Trusted by leading pharmacy chains</p>
                    <div className="lp-logos__row">
                        {['MedPlus Network','HealthFirst','CityRx Group','WellCare Pharmacy','QuickMeds','PharmaHub'].map(name => (
                            <div key={name} className="lp-logos__item">{name}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="lp-section">
                <div className="lp-section__inner">
                    <div className="lp-section__head">
                        <div className="lp-tag">Platform Features</div>
                        <h2 className="lp-section__title">Everything your pharmacy needs</h2>
                        <p className="lp-section__sub">One platform to manage operations, patients, inventory, and analytics — with zero complexity.</p>
                    </div>

                    <div className="lp-features">
                        {features.map((f, i) => (
                            <div key={i} className={`lp-feature lp-feature--${f.size} lp-feature--${f.color}`}>
                                {f.tag && <span className="lp-feature__tag">{f.tag}</span>}
                                <div className="lp-feature__icon">{f.icon}</div>
                                <h3 className="lp-feature__title">{f.title}</h3>
                                <p className="lp-feature__desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STATS BAND ── */}
            <section className="lp-stats">
                <div className="lp-stats__inner">
                    {[
                        { num: '99.9%', label: 'Platform uptime' },
                        { num: '10M+', label: 'Prescriptions filled' },
                        { num: '87%', label: 'Fewer errors' },
                        { num: '24hr', label: 'Onboarding time' },
                    ].map((s, i) => (
                        <div key={i} className="lp-stat">
                            <span className="lp-stat__num">{s.num}</span>
                            <span className="lp-stat__label">{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── ABOUT ── */}
            <section id="about" className="lp-section lp-section--alt">
                <div className="lp-section__inner">
                    <div className="lp-about">
                        <div className="lp-about__content">
                            <div className="lp-tag">About PharmaCare</div>
                            <h2 className="lp-section__title lp-section__title--left">
                                Built by pharmacists,<br />for pharmacists
                            </h2>
                            <p className="lp-about__text">
                                We've lived the challenges of running a busy pharmacy — the manual stock counts, the prescription backlogs, the missed expiry dates. PharmaCare was built to eliminate all of it, so you can focus on what actually matters: your patients.
                            </p>
                            <ul className="lp-checklist">
                                {[
                                    'Reduce dispensing errors by up to 90%',
                                    'Automate reordering — never go out of stock',
                                    'Full audit trail for every prescription',
                                    'Multi-branch support with one login',
                                ].map((item, i) => (
                                    <li key={i}><FaCheckCircle className="lp-check__icon" /> {item}</li>
                                ))}
                            </ul>
                            <Link to="/user/login" className="lp-btn lp-btn--primary lp-btn--lg">
                                Get started free <FaArrowRight />
                            </Link>
                        </div>

                        <div className="lp-about__cards">
                            <div className="lp-acard lp-acard--highlight">
                                <span className="lp-acard__num">98%</span>
                                <span className="lp-acard__label">Customer satisfaction</span>
                            </div>
                            <div className="lp-acard">
                                <span className="lp-acard__num">24hr</span>
                                <span className="lp-acard__label">Quick onboarding</span>
                            </div>
                            <div className="lp-acard">
                                <span className="lp-acard__num">50+</span>
                                <span className="lp-acard__label">Integrations</span>
                            </div>
                            <div className="lp-acard lp-acard--dark">
                                <span className="lp-acard__num">5K+</span>
                                <span className="lp-acard__label">Active pharmacies</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="lp-section">
                <div className="lp-section__inner">
                    <div className="lp-section__head">
                        <div className="lp-tag">Testimonials</div>
                        <h2 className="lp-section__title">Loved by pharmacy professionals</h2>
                    </div>
                    <div className="lp-testimonials">
                        {testimonials.map((t, i) => (
                            <div key={i} className="lp-tcard">
                                <div className="lp-tcard__stars">
                                    {[...Array(5)].map((_, j) => <FaStar key={j} />)}
                                </div>
                                <p className="lp-tcard__text">"{t.text}"</p>
                                <div className="lp-tcard__author">
                                    <div className="lp-tcard__avatar">{t.name[0]}</div>
                                    <div>
                                        <div className="lp-tcard__name">{t.name}</div>
                                        <div className="lp-tcard__role">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CONTACT ── */}
            <section id="contact" className="lp-section lp-section--alt">
                <div className="lp-section__inner">
                    <div className="lp-contact">
                        <div className="lp-contact__info">
                            <div className="lp-tag">Contact us</div>
                            <h2 className="lp-section__title lp-section__title--left">Let's talk</h2>
                            <p className="lp-about__text">
                                Whether you're ready to get started or just have questions, our team is here to help — no pushy sales tactics.
                            </p>
                            <div className="lp-cinfo">
                                {[
                                    { icon: <FaPhone />, label: 'Call us', val: '+1 (555) 123-4567' },
                                    { icon: <FaEnvelope />, label: 'Email us', val: 'support@pharmacare.com' },
                                    { icon: <FaMapMarkerAlt />, label: 'Office', val: '123 Health Tech Blvd, CA 94025' },
                                    { icon: <FaClock />, label: 'Hours', val: 'Mon–Fri, 9AM–6PM PST' },
                                ].map((item, i) => (
                                    <div key={i} className="lp-cinfo__row">
                                        <div className="lp-cinfo__icon">{item.icon}</div>
                                        <div>
                                            <div className="lp-cinfo__label">{item.label}</div>
                                            <div className="lp-cinfo__val">{item.val}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleContactSubmit} className="lp-contact__form">
                            <h3 className="lp-form__title">Send a message</h3>
                            <div className="lp-form__row">
                                <div className="lp-form__group">
                                    <label>Full name</label>
                                    <input type="text" name="name" value={contactForm.name} onChange={handleContactChange} required placeholder="Jane Smith" />
                                </div>
                                <div className="lp-form__group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={contactForm.email} onChange={handleContactChange} required placeholder="jane@pharmacy.com" />
                                </div>
                            </div>
                            <div className="lp-form__group">
                                <label>Message</label>
                                <textarea name="message" rows="5" value={contactForm.message} onChange={handleContactChange} required placeholder="Tell us about your pharmacy and what you're looking for..." />
                            </div>
                            <button type="submit" className="lp-btn lp-btn--primary lp-btn--full">
                                Send message <FaArrowRight />
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* ── CTA BAND ── */}
            <section className="lp-cta">
                <div className="lp-cta__inner">
                    <h2 className="lp-cta__title">Ready to transform your pharmacy?</h2>
                    <p className="lp-cta__sub">Join 5,000+ pharmacies running smarter with PharmaCare.</p>
                    <div className="lp-cta__btns">
                        <Link to="/user/login" className="lp-btn lp-btn--white lp-btn--lg">Start for free</Link>
                        <a href="#contact" className="lp-btn lp-btn--outline-white lp-btn--lg">Talk to sales</a>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="lp-footer">
                <div className="lp-footer__inner">
                    <div className="lp-footer__top">
                        <div className="lp-footer__brand">
                            <Link to="/" className="lp-footer__logo-wrap">
                                <img src={logo} alt="PharmaCare" className="lp-nav__logo" />
                                <span className="lp-footer__name">PharmaCare</span>
                            </Link>
                            <p>Modern pharmacy management for the digital age. Trusted by 5,000+ professionals worldwide.</p>
                            <div className="lp-footer__socials">
                                <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                                <a href="#" aria-label="Twitter"><FaTwitter /></a>
                                <a href="#" aria-label="Instagram"><FaInstagram /></a>
                                <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
                            </div>
                        </div>

                        <div className="lp-footer__cols">
                            <div className="lp-footer__col">
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#">Pricing</a>
                                <a href="#">Integrations</a>
                                <a href="#">Changelog</a>
                            </div>
                            <div className="lp-footer__col">
                                <h4>Company</h4>
                                <a href="#about">About</a>
                                <a href="#">Careers</a>
                                <a href="#">Blog</a>
                                <a href="#contact">Contact</a>
                            </div>
                            <div className="lp-footer__col">
                                <h4>Legal</h4>
                                <a href="#">Privacy</a>
                                <a href="#">Terms</a>
                                <a href="#">HIPAA</a>
                                <a href="#">Security</a>
                            </div>
                        </div>
                    </div>

                    <div className="lp-footer__bottom">
                        <p>&copy; {new Date().getFullYear()} PharmaCare Solutions. All rights reserved.</p>
                        <div className="lp-footer__portals">
                            <Link to="/admin/login">Admin Portal</Link>
                            <span>·</span>
                            <Link to="/clinic/login">Clinic Staff</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
