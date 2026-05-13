import styles from './StatusBadge.module.css';

/* ── Status → visual config map ─────────────────────────────
   Keys are normalized (lowercase, trimmed) so they match
   robustly regardless of how the backend returns the string.
   ────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  // Workflow statuses
  'criado':             { label: 'Criado',          variant: 'created'  },
  'em análise':         { label: 'Em Análise',       variant: 'analysis' },
  'em analise':         { label: 'Em Análise',       variant: 'analysis' },
  'aguardando cliente': { label: 'Aguardando Cliente', variant: 'waiting' },
  'resolvido':          { label: 'Resolvido',        variant: 'resolved' },
  'fechado':            { label: 'Fechado',          variant: 'closed'   },

  // Reply counts (e.g. "resposta 1", "resposta 2")
  'resposta':           { label: null /* dynamic */,  variant: 'reply'   },
};

/**
 * Resolves a raw status string to its { label, variant } config.
 * Handles dynamic strings like "Resposta 1".
 */
function resolveStatus(rawStatus = '') {
  const normalized = rawStatus.trim().toLowerCase();

  // Direct match
  if (STATUS_CONFIG[normalized]) {
    const cfg = STATUS_CONFIG[normalized];
    return { label: cfg.label ?? rawStatus, variant: cfg.variant };
  }

  // Prefix match for "resposta N"
  if (normalized.startsWith('resposta')) {
    return { label: rawStatus.trim(), variant: 'reply' };
  }

  // Fallback — render as-is with neutral style
  return { label: rawStatus.trim(), variant: 'default' };
}

/* ────────────────────────────────────────────────────────── */

/**
 * StatusBadge
 *
 * Props:
 *   status  {string}  — raw status string from the API
 *                       e.g. 'Criado', 'Em Análise', 'Resposta 1'
 *   size    {'sm'|'md'} — optional size override (default: 'sm')
 */
export default function StatusBadge({ status = '', size = 'sm' }) {
  const { label, variant } = resolveStatus(status);

  return (
    <span
      className={`${styles.badge} ${styles[variant]} ${styles[`size-${size}`]}`}
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
}
