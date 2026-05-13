import { useEffect, useRef, useState } from 'react';
import StatusBadge from './StatusBadge';
import styles from './TicketModal.module.css';

/* ── Icons ───────────────────────────────────────────────────
   All inline SVGs — zero external dependencies.
   ────────────────────────────────────────────────────────── */
function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

/* ── Timeline event icons ─────────────────────────────────── */
function TimelineIcon({ type }) {
  const shared = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

  if (type === 'created') return (
    <svg {...shared}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 8 12 12 14 14" />
    </svg>
  );

  if (type === 'assigned') return (
    <svg {...shared}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  if (type === 'status') return (
    <svg {...shared}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );

  if (type === 'comment') return (
    <svg {...shared}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );

  return null;
}

/* ── Priority badge (mirrors TicketCard's internal logic) ─── */
const PRIORITY_MAP = {
  1: { label: 'Alta',  cls: 'high'   },
  2: { label: 'Alta',  cls: 'high'   },
  3: { label: 'Média', cls: 'medium' },
  4: { label: 'Média', cls: 'medium' },
  5: { label: 'Baixa', cls: 'low'    },
  6: { label: 'Baixa', cls: 'low'    },
};

function PriorityBadge({ idCategoria }) {
  const p = PRIORITY_MAP[Number(idCategoria)] ?? { label: '—', cls: 'unknown' };
  return (
    <span className={`${styles.priorityBadge} ${styles[`priority-${p.cls}`]}`}>
      {p.label}
    </span>
  );
}

/* ── Mocked activity timeline ─────────────────────────────── */
const MOCK_HISTORY = [
  {
    id: 'h1',
    type: 'created',
    title: 'Ticket criado',
    tags: ['criado'],
    actor: null,
    timestamp: '2026-04-13 14:30',
  },
  {
    id: 'h2',
    type: 'assigned',
    title: 'Ticket atribuído para @João Santos',
    tags: [],
    actor: 'Sistema',
    timestamp: '2026-04-13 14:35',
  },
  {
    id: 'h3',
    type: 'status',
    title: 'Status alterado',
    tags: ['criado', 'em_analise'],
    actor: 'João Santos',
    timestamp: '2026-04-13 14:36',
    statusArrow: true,   // render "criado → em_analise" style
  },
];

/* ── Timeline item ────────────────────────────────────────── */
function TimelineItem({ event, isLast }) {
  return (
    <li className={`${styles.timelineItem} ${isLast ? styles.timelineItemLast : ''}`}>
      {/* Icon + vertical connector line */}
      <div className={styles.timelineIconWrap} aria-hidden="true">
        <span className={styles.timelineIconCircle}>
          <TimelineIcon type={event.type} />
        </span>
        {!isLast && <span className={styles.timelineConnector} />}
      </div>

      {/* Content */}
      <div className={styles.timelineContent}>
        <div className={styles.timelineRow}>
          <span className={styles.timelineTitle}>{event.title}</span>
          <time className={styles.timelineTime} dateTime={event.timestamp}>
            {event.timestamp}
          </time>
        </div>

        {/* Status tag(s) */}
        {event.tags.length > 0 && (
          <div className={styles.timelineTags}>
            {event.statusArrow && event.tags.length === 2 ? (
              <>
                <span className={styles.timelineTag}>{event.tags[0]}</span>
                <span className={styles.timelineArrow} aria-hidden="true">→</span>
                <span className={`${styles.timelineTag} ${styles.timelineTagAccent}`}>{event.tags[1]}</span>
              </>
            ) : (
              event.tags.map((tag) => (
                <span key={tag} className={styles.timelineTag}>{tag}</span>
              ))
            )}
          </div>
        )}

        {/* Actor name */}
        {event.actor && (
          <span className={styles.timelineActor}>{event.actor}</span>
        )}
      </div>
    </li>
  );
}

/* ────────────────────────────────────────────────────────── */

/**
 * TicketModal
 *
 * Props:
 *   ticket   {object|null}  — ticket object; modal renders only when truthy
 *   onClose  {function}     — called when the user closes the modal
 *
 * Ticket object shape (same keys as TicketCard):
 *   protocolo, titulo, descricao, idCategoria, status, tempoRestanteSLA
 */
export default function TicketModal({ ticket, onClose }) {
  const [comment, setComment] = useState('');
  const dialogRef = useRef(null);
  const inputRef  = useRef(null);

  /* Close on Escape */
  useEffect(() => {
    if (!ticket) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [ticket, onClose]);

  /* Lock body scroll while open */
  useEffect(() => {
    if (ticket) {
      document.body.style.overflow = 'hidden';
      // Auto-focus the dialog for screen readers
      dialogRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [ticket]);

  if (!ticket) return null;

  const protocoloLabel = ticket.protocolo !== undefined ? `#${ticket.protocolo}` : null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const handleSend = () => {
    if (!comment.trim()) return;
    // UI-only: real submit logic goes here
    setComment('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
  };

  return (
    /* ── Backdrop ── */
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="presentation"
    >
      {/* ── Dialog ── */}
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        {/* ── Header ── */}
        <div className={styles.header}>
          {/* Meta row: #N · Priority · Status */}
          <div className={styles.metaRow}>
            {protocoloLabel && (
              <span className={styles.protocolo}>{protocoloLabel}</span>
            )}
            <PriorityBadge idCategoria={ticket.idCategoria} />
            <StatusBadge status={ticket.status} size="sm" />
          </div>

          {/* Close button */}
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <IconX />
          </button>
        </div>

        {/* ── Title + description ── */}
        <div className={styles.titleBlock}>
          <h2 id="modal-title" className={styles.title}>{ticket.titulo}</h2>
          {ticket.descricao && (
            <p className={styles.description}>{ticket.descricao}</p>
          )}
          {ticket.tempoRestanteSLA && (
            <span className={styles.timestamp}>
              <IconClock />
              Criado {ticket.tempoRestanteSLA}
            </span>
          )}
        </div>

        <div className={styles.divider} aria-hidden="true" />

        {/* ── Scrollable body ── */}
        <div className={styles.body}>
          {/* Activity timeline */}
          <section aria-label="Histórico de atividades">
            <h3 className={styles.sectionTitle}>Histórico de Atividades</h3>
            <ol className={styles.timeline}>
              {MOCK_HISTORY.map((event, i) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  isLast={i === MOCK_HISTORY.length - 1}
                />
              ))}
            </ol>
          </section>
        </div>

        {/* ── Comment input ── */}
        <div className={styles.commentBar}>
          <input
            ref={inputRef}
            className={styles.commentInput}
            type="text"
            placeholder="Adicionar comentário..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Adicionar comentário"
          />
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!comment.trim()}
            aria-label="Enviar comentário"
          >
            <span className={styles.sendLabel}>Enviar</span>
            <IconSend />
          </button>
        </div>
      </div>
    </div>
  );
}
