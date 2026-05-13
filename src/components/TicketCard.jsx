import StatusBadge from './StatusBadge';
import styles from './TicketCard.module.css';

/* ── idCategoria → priority config ──────────────────────────
   This map is the SINGLE source of truth that translates the
   backend's numeric category ID into the visual priority label
   and color variant shown in the card header badge.

   Extend this map as new categories are added to the system.
   ────────────────────────────────────────────────────────── */
const CATEGORY_PRIORITY_MAP = {
  // Alta (High) — vermelho
  1:  { label: 'Alta',  variant: 'high'   },
  2:  { label: 'Alta',  variant: 'high'   },

  // Média (Medium) — amarelo
  3:  { label: 'Média', variant: 'medium' },
  4:  { label: 'Média', variant: 'medium' },

  // Baixa (Low) — verde
  5:  { label: 'Baixa', variant: 'low'    },
  6:  { label: 'Baixa', variant: 'low'    },
  7:  { label: 'Baixa', variant: 'low'    },
};

/**
 * Resolves an idCategoria to its priority display config.
 * Returns a safe fallback if the ID is unknown.
 *
 * @param {number|string} idCategoria
 * @returns {{ label: string, variant: 'high'|'medium'|'low'|'unknown' }}
 */
function resolvePriority(idCategoria) {
  return CATEGORY_PRIORITY_MAP[Number(idCategoria)] ?? { label: '—', variant: 'unknown' };
}

/* ── Clock icon (inline SVG, no external dep) ─────────────── */
function ClockIcon() {
  return (
    <svg
      className={styles.clockIcon}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/* ── Avatar initials helper ───────────────────────────────── */
function Avatar({ name }) {
  if (!name) return null;
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <span className={styles.avatar} aria-label={name} title={name}>
      {initials}
    </span>
  );
}

/* ────────────────────────────────────────────────────────── */

/**
 * TicketCard
 *
 * Props (matching the backend contract):
 *   protocolo         {string|number} — e.g. "#4" or 4
 *   titulo            {string}        — ticket title
 *   descricao         {string}        — short description / preview text
 *   idCategoria       {number}        — drives the priority badge color internally
 *   statusAtual       {string}        — raw status string forwarded to <StatusBadge>
 *   tempoRestanteSLA  {string}        — human-readable SLA time, e.g. "2h atrás", "1d atrás"
 *   responsavel       {string}        — optional assignee name for avatar
 *   onClick           {function}      — called when the card is clicked
 */
export default function TicketCard({
  protocolo,
  titulo = 'Sem título',
  descricao = '',
  idCategoria,
  statusAtual = 'Criado',
  tempoRestanteSLA,
  responsavel,
  onClick,
}) {
  const priority = resolvePriority(idCategoria);
  const protocoloLabel = protocolo !== undefined ? `#${protocolo}` : null;

  return (
    <article
      className={styles.card}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      aria-label={`Ticket ${protocoloLabel ?? ''}: ${titulo}`}
    >
      {/* ── Card header: title + priority badge ── */}
      <div className={styles.header}>
        <h3 className={styles.title}>{titulo}</h3>
        <span className={`${styles.priorityBadge} ${styles[`priority-${priority.variant}`]}`}>
          {priority.label}
        </span>
      </div>

      {/* ── Description preview ── */}
      {descricao && (
        <p className={styles.description}>{descricao}</p>
      )}

      {/* ── Footer: status badge + SLA time + assignee ── */}
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <StatusBadge status={statusAtual} size="sm" />
          {tempoRestanteSLA && (
            <span className={styles.sla}>
              <ClockIcon />
              {tempoRestanteSLA}
            </span>
          )}
        </div>

        {responsavel && (
          <div className={styles.footerRight}>
            <Avatar name={responsavel} />
            <span className={styles.responsavelName}>{responsavel}</span>
          </div>
        )}
      </div>
    </article>
  );
}
