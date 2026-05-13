import { useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom'; // <-- Injetado: Motor de rotas
import styles from './Sidebar.module.css';

/* ── Nav items ───────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    id: 'menu',
    label: 'Menu',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
      </svg>
    ),
  },
];

/* ── Popover icons ───────────────────────────────────────── */
function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/* ── Avatar initials helper ──────────────────────────────── */
function getInitials(email = '') {
  return email.charAt(0).toUpperCase() || 'U';
}

/* ─────────────────────────────────────────────────────────── */

export default function Sidebar({ userEmail = 'demo@demo.com.br' }) {
  const { logout } = useAuth0();
  const navigate = useNavigate(); // <-- Injetado: Hook para navegar
  const location = useLocation(); // <-- Injetado: Lê a URL atual

  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  /* ── Click-outside + Escape to close ─────────────────────── */
  useEffect(() => {
    if (!popoverOpen) return;

    function handleOutsideClick(e) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setPopoverOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === 'Escape') {
        setPopoverOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown',   handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown',   handleEscape);
    };
  }, [popoverOpen]);

  /* ── Auth0 logout ─────────────────────────────────────────── */
  function handleLogout() {
    logout({ logoutParams: { returnTo: window.location.origin } });
  }

  return (
    <aside className={styles.sidebar}>
      {/* ── Logo ── */}
      <div className={styles.logo}>
        <span className={styles.logoText}>TicketFlow</span>
      </div>

      {/* ── Navigation ── */}
      <nav className={styles.nav} aria-label="Navegação principal">
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => {
            // Lógica de Roteamento Dinâmico
            const itemPath = item.id === 'menu' ? '/' : `/${item.id}`;
            const isActive = location.pathname === itemPath;

            return (
              <li key={item.id}>
                <button
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  onClick={() => navigate(itemPath)} // <-- Muda a URL!
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Footer area: popover + trigger ── */}
      <div className={styles.footerWrap}>
        {popoverOpen && (
          <div
            ref={popoverRef}
            className={styles.popover}
            role="menu"
            aria-label="Opções do usuário"
          >
            <button className={styles.popoverItem} role="menuitem" onClick={() => setPopoverOpen(false)}>
              <span className={styles.popoverIcon}><IconSettings /></span>
              Configurações
            </button>
            <button className={styles.popoverItem} role="menuitem" onClick={() => setPopoverOpen(false)}>
              <span className={styles.popoverIcon}><IconMoon /></span>
              Tema
            </button>
            <div className={styles.popoverDivider} aria-hidden="true" />
            <button
              className={`${styles.popoverItem} ${styles.popoverItemDanger}`}
              role="menuitem"
              onClick={handleLogout}
            >
              <span className={styles.popoverIcon}><IconLogout /></span>
              Sair
            </button>
          </div>
        )}

        {/* User trigger button */}
        <button
          ref={triggerRef}
          className={`${styles.userTrigger} ${popoverOpen ? styles.userTriggerActive : ''}`}
          onClick={() => setPopoverOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={popoverOpen}
          aria-label="Abrir menu do usuário"
        >
          <div className={styles.avatar} aria-hidden="true">
            {getInitials(userEmail)}
          </div>
          <span className={styles.userEmail}>{userEmail}</span>
        </button>
      </div>
    </aside>
  );
}