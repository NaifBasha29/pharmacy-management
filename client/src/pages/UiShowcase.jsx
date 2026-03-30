import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiLayers,
  FiLock,
  FiMonitor,
  FiPackage,
  FiShield,
  FiShoppingCart,
  FiUsers
} from 'react-icons/fi';
import uiPreviewImage from '../../assets/lp.png';
import logo from '../../assets/logo.png';
import './UiShowcase.css';

const roleCards = [
  {
    title: 'Admin Console',
    description: 'User, clinic, inventory, and compliance oversight with dashboards.',
    badge: 'Role: admin',
    link: '/admin/login',
    accent: '#f97316',
    highlights: ['Clinics & users', 'Inventory alerts', 'Audit logs'],
    shortName: 'Admin'
  },
  {
    title: 'Clinic Portal',
    description: 'Manage clinic profile, enrollments, and prescriptions in one place.',
    badge: 'Role: clinic admin',
    link: '/clinic/login',
    accent: '#22c55e',
    highlights: ['Clinic enrollment', 'Patient linkage', 'Status controls'],
    shortName: 'Clinic'
  },
  {
    title: 'Pharmacist Workspace',
    description: 'Dispensing, verification queues, and patient safety checks.',
    badge: 'Role: pharmacist',
    link: '/pharmacist',
    accent: '#06b6d4',
    highlights: ['Verify scripts', 'Low-stock cues', 'Patient records'],
    shortName: 'Pharmacist'
  },
  {
    title: 'Patient Dashboard',
    description: 'Catalog, orders, prescriptions, and support chat for patients.',
    badge: 'Role: user',
    link: '/user/login',
    accent: '#8b5cf6',
    highlights: ['Browse catalog', 'Track orders', 'Upload prescriptions'],
    shortName: 'Patient'
  }
];

const featureTiles = [
  { icon: <FiActivity />, title: 'Dashboards', copy: 'Role-based insights with KPIs and charts.' },
  { icon: <FiPackage />, title: 'Inventory', copy: 'Real-time stock with low/expiring alerts.' },
  { icon: <FiUsers />, title: 'User & Clinics', copy: 'Enrollment, verification, and access control.' },
  { icon: <FiShoppingCart />, title: 'Orders', copy: 'Statuses, dispensing, and delivery tracking.' },
  { icon: <FiShield />, title: 'Compliance', copy: 'Audit logs and session protections baked in.' },
  { icon: <FiLock />, title: 'Auth Flows', copy: 'Dedicated logins per role with guarded routes.' }
];

const previewStats = [
  { label: 'Active Clinics', value: 24, tone: 'orange' },
  { label: 'Pending Prescriptions', value: 18, tone: 'purple' },
  { label: 'Low Stock Items', value: 12, tone: 'red' },
  { label: 'Today\'s Orders', value: 142, tone: 'blue' }
];

const UiShowcase = () => {
  return (
    <div className="ui-showcase">
      <header className="ui-nav">
        <div className="ui-nav__brand">
          <img src={logo} alt="PharmaCare" className="ui-nav__logo" />
          <div>
            <p className="ui-nav__title">PharmaCare</p>
            <p className="ui-nav__subtitle">Client UI Preview</p>
          </div>
        </div>
        <div className="ui-nav__actions">
          <Link to="/" className="ui-nav__link">Landing</Link>
          <Link to="/user/login" className="ui-nav__primary">Open App</Link>
        </div>
      </header>

      <section className="ui-hero">
        <div className="ui-hero__content">
          <div className="ui-badge">UI only — No backend required to explore visuals</div>
          <h1>Explore the complete client experience</h1>
          <p>
            Quickly preview every role-based screen, navigation pattern, and layout without needing API connectivity.
            Use the quick links below to jump into any workspace or share this page with stakeholders.
          </p>
          <div className="ui-cta">
            <Link to="/user/login" className="btn-primary">Start as Patient</Link>
            <Link to="/admin/login" className="btn-secondary">Try Admin Console</Link>
          </div>
          <div className="ui-quick-links">
            <div className="ui-chip"><FiLock /> Auth: Admin / Clinic / Patient</div>
            <div className="ui-chip"><FiLayers /> Layouts: Dashboards, tables, forms</div>
            <div className="ui-chip"><FiCheckCircle /> Guards: Protected routes per role</div>
          </div>
          </div>
          <div className="ui-hero__visual">
            <div className="ui-hero__image">
              <img src={uiPreviewImage} alt="UI preview" />
            </div>
            <div className="ui-hero__stats">
              {previewStats.map((s) => (
              <div key={s.label} className={`ui-hero__stat ui-hero__stat--${s.tone}`}>
                <span>{s.label}</span>
                <strong>{s.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ui-grid">
        <div className="ui-section__head">
          <span className="ui-tag">Roles</span>
          <h2>Ready-to-use workspaces</h2>
          <p>Each role has dedicated routing, navigation, and components. Use these cards to jump directly into the experience.</p>
        </div>
        <div className="ui-roles">
          {roleCards.map((role) => (
            <div key={role.title} className="ui-card">
              <div className="ui-card__badge" style={{ background: `${role.accent}1a`, color: role.accent }}>
                {role.badge}
              </div>
              <h3>{role.title}</h3>
              <p className="ui-card__copy">{role.description}</p>
              <div className="ui-card__highlights">
                {role.highlights.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <Link to={role.link} className="ui-card__link" style={{ color: role.accent }}>
                Open {role.shortName} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="ui-grid ui-grid--features">
        <div className="ui-section__head">
          <span className="ui-tag">Highlights</span>
          <h2>What you can see in the client</h2>
          <p>Preview the primary UX surfaces that ship with the PharmaCare frontend.</p>
        </div>
        <div className="ui-features">
          {featureTiles.map((tile) => (
            <div key={tile.title} className="ui-feature">
              <div className="ui-feature__icon">{tile.icon}</div>
              <div>
                <h4>{tile.title}</h4>
                <p>{tile.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UiShowcase;
