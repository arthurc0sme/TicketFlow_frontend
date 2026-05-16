import { useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import styles from './Sidebar.module.css';

/* ── Icons ───────────────────────────────────────────────────
   One inline SVG per nav item — zero external dependencies.
   ────────────────────────────────────────────────────────── */

/* Shared icon wrapper — keeps all SVGs on the same grid */
function Icon({ children }) {
  return (
    <svg
      width="17" height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const Icons = {
  /* Department tickets — inbox tray */
  department: (
    <Icon>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </Icon>
  ),
  /* No technician — user with question mark */
  unassigned: (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7" />
      <path d="M19 16v6" />
      <path d="M22 19h-6" />
    </Icon>
  ),
  /* My tickets — user circle */
  mine: (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
    </Icon>
  ),
  /* Awaiting reply — clock with speech bubble */
  waiting: (
    <Icon>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="10" r="0.5" fill="currentColor" />
      <circle cx="8"  cy="10" r="0.5" fill="currentColor" />
      <circle cx="16" cy="10" r="0.5" fill="currentColor" />
    </Icon>
  ),
  /* Resolved — circle check */
  resolved: (
    <Icon>
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </Icon>
  ),
  /* Confirmed — double check / shield check */
  confirmed: (
    <Icon>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <polyline points="9 12 11 14 15 10" />
    </Icon>
  ),
  /* Default dashboard grid (for non-tech 'Menu') */
  menu: (
    <Icon>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </Icon>
  ),
  /* Tickets generic */
  tickets: (
    <Icon>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
    </Icon>
  ),
};

/* ── Nav item definitions per role ───────────────────────────
   Each item: { id, label, icon }
   ────────────────────────────────────────────────────────── */
const NAV_ITEMS_BY_ROLE = {
  /* Standard user / manager view */
  default: [
    { id: 'menu',    label: 'Menu',    icon: Icons.menu    },
    { id: 'tickets', label: 'Tickets', icon: Icons.tickets },
  ],

  /* Technician queue view */
  tech: [
    { id: 'department', label: 'Tickets do Departamento', icon: Icons.department },
    { id: 'unassigned', label: 'Sem Técnico',             icon: Icons.unassigned },
    { id: 'mine',       label: 'Meus Tickets',            icon: Icons.mine       },
    { id: 'waiting',    label: 'Aguardando Resposta',      icon: Icons.waiting    },
    { id: 'resolved',   label: 'Resolvidos',              icon: Icons.resolved   },
    { id: 'confirmed',  label: 'Confirmados',             icon: Icons.confirmed  },
  ],
};

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

/* ── Avatar initials ─────────────────────────────────────── */
function getInitials(email = '') {
  return email.charAt(0).toUpperCase() || 'U';
}

/* ─────────────────────────────────────────────────────────── */

/**
 * Sidebar
 *
 * Props:
 *   activeItem  {string}              — id of the currently active nav item
 *   onNavigate  {function}            — called with item id on nav click
 *   userEmail   {string}              — displayed in the footer trigger
 *   userRole    {'tech'|'default'}    — controls which nav items are shown
 *                                       (temporary prop, will come from auth context later)
 */
export default function Sidebar({
  activeItem  = 'department',
  onNavigate,
  userEmail   = 'demo@demo.com.br',
  userRole    = 'tech',
}) {
  const { logout } = useAuth0();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  /* Resolve nav items for this role; fall back to default */
  const navItems = NAV_ITEMS_BY_ROLE[userRole] ?? NAV_ITEMS_BY_ROLE.default;

  /* ── Click-outside + Escape ───────────────────────────────── */
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
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  onClick={() => onNavigate?.(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Footer: popover + user trigger ── */}
      <div className={styles.footerWrap}>
        {popoverOpen && (
          <div
            ref={popoverRef}
            className={styles.popover}
            role="menu"
            aria-label="Opções do usuário"
          >
            <button
              className={styles.popoverItem}
              role="menuitem"
              onClick={() => setPopoverOpen(false)}
            >
              <span className={styles.popoverIcon}><IconSettings /></span>
              Configurações
            </button>

            <button
              className={styles.popoverItem}
              role="menuitem"
              onClick={() => setPopoverOpen(false)}
            >
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
