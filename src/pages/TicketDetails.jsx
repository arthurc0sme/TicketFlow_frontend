import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import styles from './TicketDetails.module.css';

/* ══════════════════════════════════════════════════════════════
   MOCK DATA
   In production, replace with a real fetch(`/api/tickets/${id}`)
   ══════════════════════════════════════════════════════════════ */
const MOCK_TICKETS_DB = {
  1: {
    id: 1, protocolo: 1, ano: 2026,
    titulo: 'Erro no sistema de pagamento',
    descricao: 'Usuários relatando falha ao processar pagamentos via cartão de crédito. O erro ocorre após inserir os dados do cartão e clicar em finalizar compra.',
    status: 'Em Análise', idCategoria: 1,
    responsavel: 'João Santos', solicitante: 'Maria Silva',
    departamento: 'Financeiro',
    criadoEm: '2026-04-13T14:30:00',
    slaTipo: 'TPR (Tempo de Primeira Resposta)',
    /* SLA deadline as ISO string — set to ~3.75h from a fixed reference
       so the countdown demo is always meaningful regardless of when you open it */
    slaDeadline: (() => { const d = new Date(); d.setSeconds(d.getSeconds() + 13500); return d.toISOString(); })(),
    history: [
      { id: 'h1', type: 'created',  title: 'Ticket criado',                    tags: ['criado'],                        actor: null,          timestamp: '2026-04-13 14:30' },
      { id: 'h2', type: 'assigned', title: 'Ticket atribuído para @João Santos', tags: [],                               actor: 'Maria Silva', timestamp: '2026-04-13 14:35' },
      { id: 'h3', type: 'status',   title: 'Status alterado',                   tags: ['criado', 'em_analise'],          actor: 'João Santos', timestamp: '2026-04-13 14:36', statusArrow: true },
      { id: 'h4', type: 'comment',  title: 'Comentário adicionado',             tags: [],                               actor: 'João Santos', timestamp: '2026-04-13 15:02', note: 'Reproduzi o erro em ambiente de staging. Aguardando acesso ao log do gateway.' },
    ],
  },
  2: {
    id: 2, protocolo: 2, ano: 2026,
    titulo: 'Layout quebrado no mobile',
    descricao: 'Interface não está responsiva em dispositivos iOS Safari.',
    status: 'Resposta 1', idCategoria: 3,
    responsavel: 'Ana Costa', solicitante: 'Pedro Lima',
    departamento: 'Produto',
    criadoEm: '2026-04-13T09:00:00',
    slaTipo: 'TA (Tempo de Atualização)',
    slaDeadline: (() => { const d = new Date(); d.setSeconds(d.getSeconds() + 1800); return d.toISOString(); })(),
    history: [
      { id: 'h1', type: 'created',  title: 'Ticket criado',       tags: ['criado'],    actor: null,         timestamp: '2026-04-13 09:00' },
      { id: 'h2', type: 'assigned', title: 'Atribuído para @Ana Costa', tags: [],      actor: 'Pedro Lima', timestamp: '2026-04-13 09:15' },
    ],
  },
};

/* Default fallback for unknown IDs */
const FALLBACK_TICKET = {
  id: 0, protocolo: 0, ano: 2026,
  titulo: 'Ticket não encontrado',
  descricao: 'Este chamado não existe ou foi removido.',
  status: 'Criado', idCategoria: 5,
  responsavel: '—', solicitante: '—', departamento: '—',
  criadoEm: new Date().toISOString(),
  slaDeadline: new Date().toISOString(),
  history: [],
};

/* ══════════════════════════════════════════════════════════════
   PRIORITY MAP  (idCategoria → label + variant)
   ══════════════════════════════════════════════════════════════ */
const PRIORITY_MAP = {
  1: { label: 'Alta',  variant: 'high'   },
  2: { label: 'Alta',  variant: 'high'   },
  3: { label: 'Média', variant: 'medium' },
  4: { label: 'Média', variant: 'medium' },
  5: { label: 'Baixa', variant: 'low'    },
  6: { label: 'Baixa', variant: 'low'    },
  7: { label: 'Baixa', variant: 'low'    },
};

/* ══════════════════════════════════════════════════════════════
   ICONS — all inline SVG, zero deps
   ══════════════════════════════════════════════════════════════ */
function Svg({ size = 16, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" {...rest}
    >{children}</svg>
  );
}

const IconArrowLeft = () => (
  <Svg size={16}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Svg>
);
const IconClock = () => (
  <Svg size={14}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>
);
const IconUser = () => (
  <Svg size={14}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Svg>
);
const IconTag = () => (
  <Svg size={14}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></Svg>
);
const IconBuilding = () => (
  <Svg size={14}><rect x="4" y="2" width="16" height="20"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><rect x="9" y="7" width="2" height="2"/><rect x="13" y="7" width="2" height="2"/><rect x="9" y="12" width="6" height="10"/></Svg>
);
const IconHash = () => (
  <Svg size={14}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></Svg>
);
const IconCalendar = () => (
  <Svg size={14}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Svg>
);
const IconSend = () => (
  <Svg size={15} strokeWidth="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Svg>
);
const IconLock = () => (
  <Svg size={15}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Svg>
);
const IconGlobe = () => (
  <Svg size={15}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Svg>
);

/* Timeline icons per event type */
function TimelineIcon({ type }) {
  if (type === 'created')  return <Svg size={15}><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></Svg>;
  if (type === 'assigned') return <Svg size={15}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Svg>;
  if (type === 'status')   return <Svg size={15}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>;
  if (type === 'comment')  return <Svg size={15}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Svg>;
  return null;
}

/* ══════════════════════════════════════════════════════════════
   SLA COUNTDOWN HOOK
   Returns { hours, minutes, seconds, urgency }
   urgency: 'ok' | 'warning' (≤ 1h) | 'critical' (≤ 15m or expired)
   ══════════════════════════════════════════════════════════════ */
function useSlaCountdown(deadlineIso) {
  const getRemaining = useCallback(() => {
    const diff = Math.max(0, new Date(deadlineIso) - Date.now());
    const totalSeconds = Math.floor(diff / 1000);
    return {
      hours:   Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      total:   totalSeconds,
      expired: diff <= 0,
    };
  }, [deadlineIso]);

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, [getRemaining]);

  const urgency =
    remaining.expired || remaining.total <= 900  ? 'critical' :  // ≤ 15 min
    remaining.total   <= 3600                    ? 'warning'  :  // ≤ 1 h
    'ok';

  return { ...remaining, urgency };
}

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════ */

/* ── Priority badge ─────────────────────────────────────── */
function PriorityBadge({ idCategoria }) {
  const p = PRIORITY_MAP[Number(idCategoria)] ?? { label: '—', variant: 'unknown' };
  return (
    <span className={`${styles.priorityBadge} ${styles[`priority-${p.variant}`]}`}>
      {p.label}
    </span>
  );
}

/* ── Metadata row (icon + label + value) ─────────────────── */
function MetaRow({ icon, label, children }) {
  return (
    <div className={styles.metaRow}>
      <span className={styles.metaIcon}>{icon}</span>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{children}</span>
    </div>
  );
}

/* ── SLA Card ────────────────────────────────────────────── */
function SlaCard({ slaDeadline, slaTipo, label = 'SLA de Atualização' }) {
  const { hours, minutes, seconds, urgency, expired } = useSlaCountdown(slaDeadline);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className={`${styles.slaCard} ${styles[`sla-${urgency}`]}`}>
      <p className={styles.slaLabel}>{label}</p>

      {expired ? (
        <p className={`${styles.slaTime} ${styles[`slaTime-${urgency}`]}`}>
          Expirado
        </p>
      ) : (
        <p className={`${styles.slaTime} ${styles[`slaTime-${urgency}`]}`} aria-live="polite" aria-atomic="true">
          {pad(hours)}h {pad(minutes)}m{' '}
          <span className={styles.slaSeconds}>{pad(seconds)}s</span>
        </p>
      )}

      {/* SLA type label — shown only when provided */}
      {slaTipo && (
        <span className={styles.slaTypeLabel} title={slaTipo}>
          {slaTipo}
        </span>
      )}

      {/* Contextual urgency hint */}
      <p className={`${styles.slaHint} ${styles[`slaHint-${urgency}`]}`}>
        {urgency === 'ok'       && 'Dentro do prazo'}
        {urgency === 'warning'  && '⚠ Atenção — menos de 1 hora'}
        {urgency === 'critical' && (expired ? '✕ SLA expirado' : '⚠ Crítico — menos de 15 minutos')}
      </p>
    </div>
  );
}

/* ── Timeline item ───────────────────────────────────────── */
function TimelineItem({ event, isLast }) {
  return (
    <li className={`${styles.timelineItem} ${isLast ? styles.timelineItemLast : ''}`}>
      {/* Icon column */}
      <div className={styles.timelineIconWrap} aria-hidden="true">
        <span className={`${styles.timelineIconCircle} ${styles[`tIcon-${event.type}`]}`}>
          <TimelineIcon type={event.type} />
        </span>
        {!isLast && <span className={styles.timelineConnector} />}
      </div>

      {/* Content column */}
      <div className={styles.timelineContent}>
        <div className={styles.timelineHeader}>
          <span className={styles.timelineTitle}>{event.title}</span>
          <time className={styles.timelineTime} dateTime={event.timestamp}>
            {event.timestamp}
          </time>
        </div>

        {/* Status arrow tags */}
        {event.tags.length > 0 && (
          <div className={styles.timelineTags}>
            {event.statusArrow && event.tags.length === 2 ? (
              <>
                <span className={styles.timelineTag}>{event.tags[0]}</span>
                <span className={styles.timelineArrow} aria-label="para">→</span>
                <span className={`${styles.timelineTag} ${styles.timelineTagAccent}`}>{event.tags[1]}</span>
              </>
            ) : (
              event.tags.map((tag) => (
                <span key={tag} className={styles.timelineTag}>{tag}</span>
              ))
            )}
          </div>
        )}

        {/* Inline note (for comments) */}
        {event.note && (
          <p className={styles.timelineNote}>{event.note}</p>
        )}

        {/* Actor */}
        {event.actor && (
          <span className={styles.timelineActor}>{event.actor}</span>
        )}
      </div>
    </li>
  );
}

/* ── Comment bar ─────────────────────────────────────────── */
function CommentBar() {
  const [comment, setComment] = useState('');

  function handleSend() {
    if (!comment.trim()) return;
    // UI-only — wire to API later
    setComment('');
  }

  return (
    <div className={styles.commentBar}>
      <input
        className={styles.commentInput}
        type="text"
        placeholder="Adicionar comentário..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend(); }}
        aria-label="Adicionar comentário"
      />
      <button
        className={styles.sendBtn}
        onClick={handleSend}
        disabled={!comment.trim()}
        aria-label="Enviar comentário"
      >
        <span>Enviar</span>
        <IconSend />
      </button>
    </div>
  );
}

/* ── Internal Note ───────────────────────────────────────────
   Amber-tinted card. Visible only to technicians — this is
   enforced at the API level; the tint is a visual safeguard
   so the technician never confuses this with a public reply.
   ────────────────────────────────────────────────────────── */
function InternalNote() {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const MAX = 1000;

  function handleSave() {
    if (!note.trim()) return;
    // UI-only — wire to POST /api/tickets/:id/notes later
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setNote('');
  }

  return (
    <div className={styles.noteCard}>
      {/* Header */}
      <div className={styles.noteHeader}>
        <span className={styles.noteHeaderIcon}>
          <IconLock />
        </span>
        <div>
          <h3 className={styles.noteTitle}>Nota Interna</h3>
          <p className={styles.noteSubtitle}>Visível apenas para a equipe técnica</p>
        </div>
      </div>

      {/* Textarea */}
      <div className={styles.noteTextareaWrap}>
        <textarea
          className={styles.noteTextarea}
          placeholder="Adicione uma nota interna sobre este chamado…"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, MAX))}
          rows={5}
          aria-label="Nota interna"
        />
        <span className={`${styles.noteCharCount} ${note.length >= MAX * 0.9 ? styles.noteCharCountWarn : ''}`}>
          {note.length}/{MAX}
        </span>
      </div>

      {/* Footer */}
      <div className={styles.noteFooter}>
        {saved && (
          <span className={styles.noteSavedFeedback} role="status" aria-live="polite">
            ✓ Nota salva
          </span>
        )}
        <button
          className={styles.noteSaveBtn}
          onClick={handleSave}
          disabled={!note.trim()}
          aria-label="Salvar nota interna"
        >
          Salvar Nota
        </button>
      </div>
    </div>
  );
}

/* ── Public Reply ─────────────────────────────────────────────
   Standard white card. This textarea sends a visible reply
   to the end user. Kept visually neutral (no amber) to
   reinforce the contrast with the Internal Note above.
   ────────────────────────────────────────────────────────── */
function PublicReply() {
  const [reply, setReply] = useState('');
  const [sent, setSent]   = useState(false);
  const MAX = 2000;

  function handleSend() {
    if (!reply.trim()) return;
    // UI-only — wire to POST /api/tickets/:id/replies later
    setSent(true);
    setTimeout(() => setSent(false), 2500);
    setReply('');
  }

  return (
    <div className={styles.replyCard}>
      {/* Header */}
      <div className={styles.replyHeader}>
        <span className={styles.replyHeaderIcon}>
          <IconGlobe />
        </span>
        <div>
          <h3 className={styles.replyTitle}>Resposta ao Usuário</h3>
          <p className={styles.replySubtitle}>Será enviada por e-mail ao solicitante</p>
        </div>
      </div>

      {/* Textarea */}
      <div className={styles.replyTextareaWrap}>
        <textarea
          className={styles.replyTextarea}
          placeholder="Escreva sua resposta ao usuário…"
          value={reply}
          onChange={(e) => setReply(e.target.value.slice(0, MAX))}
          rows={5}
          aria-label="Resposta ao usuário"
        />
        <span className={`${styles.replyCharCount} ${reply.length >= MAX * 0.9 ? styles.replyCharCountWarn : ''}`}>
          {reply.length}/{MAX}
        </span>
      </div>

      {/* Footer */}
      <div className={styles.replyFooter}>
        {sent && (
          <span className={styles.replySentFeedback} role="status" aria-live="polite">
            ✓ Resposta enviada
          </span>
        )}
        <button
          className={styles.replySendBtn}
          onClick={handleSend}
          disabled={!reply.trim()}
          aria-label="Enviar resposta ao usuário"
        >
          <IconSend />
          Enviar Resposta
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════ */
export default function TicketDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  /* Resolve ticket — in production swap for a real fetch/query */
  const ticket = MOCK_TICKETS_DB[Number(id)] ?? FALLBACK_TICKET;

  /* Format protocol as '001/2026' */
  const protocoloFormatado = `${String(ticket.protocolo).padStart(3, '0')}/${ticket.ano}`;

  /* Format creation date */
  const criadoEm = new Date(ticket.criadoEm).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={styles.layout}>
      {/* ── Fixed sidebar ── */}
      <Sidebar
        activeItem="mine"
        onNavigate={(page) => navigate(`/${page === 'tickets' ? 'tickets' : ''}`)}
        userEmail="demo@demo.com.br"
        userRole="tech"
      />

      {/* ── Scrollable main ── */}
      <div className={styles.main}>

        {/* ── Page header bar ─────────────────────────────── */}
        <header className={styles.pageHeader}>
          <button
            className={styles.backBtn}
            onClick={() => navigate(-1)}
            aria-label="Voltar para chamados"
          >
            <IconArrowLeft />
            Voltar para chamados
          </button>
          <h1 className={styles.pageTitle}>{ticket.titulo}</h1>
        </header>

        {/* ── 3-column grid ───────────────────────────────── */}
        <div className={styles.grid}>

          {/* ══ COL 1 — Left: Communication inputs ══════════ */}
          <aside className={styles.colLeft} aria-label="Comunicação do ticket">
            <InternalNote />
            <PublicReply />
          </aside>

          {/* ══ COL 2 — Center: Timeline ═════════════════════ */}
          <section className={styles.colCenter} aria-label="Histórico de atividades">
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Histórico de Atividades</h2>

              <ol className={styles.timeline}>
                {ticket.history.map((event, i) => (
                  <TimelineItem
                    key={event.id}
                    event={event}
                    isLast={i === ticket.history.length - 1}
                  />
                ))}
                {ticket.history.length === 0 && (
                  <li className={styles.emptyTimeline}>Nenhuma atividade registrada.</li>
                )}
              </ol>
            </div>

            {/* Comment input pinned below the timeline card */}
            <CommentBar />
          </section>

          {/* ══ COL 3 — Right: Metadata + SLA ═══════════════ */}
          <aside className={styles.colRight} aria-label="Detalhes e SLA">

            {/* SLA countdown */}
            <SlaCard slaDeadline={ticket.slaDeadline} slaTipo={ticket.slaTipo} />

            {/* Ticket metadata card */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Informações</h2>

              <div className={styles.metaList}>
                <MetaRow icon={<IconHash />} label="Protocolo">
                  <span className={styles.protocoloBadge}>{protocoloFormatado}</span>
                </MetaRow>

                <MetaRow icon={<IconTag />} label="Prioridade">
                  <PriorityBadge idCategoria={ticket.idCategoria} />
                </MetaRow>

                <MetaRow icon={<IconClock />} label="Status">
                  <StatusBadge status={ticket.status} size="sm" />
                </MetaRow>

                <div className={styles.metaDivider} aria-hidden="true" />

                <MetaRow icon={<IconUser />} label="Solicitante">
                  {ticket.solicitante}
                </MetaRow>

                <MetaRow icon={<IconUser />} label="Responsável">
                  {ticket.responsavel}
                </MetaRow>

                <MetaRow icon={<IconBuilding />} label="Departamento">
                  {ticket.departamento}
                </MetaRow>

                <div className={styles.metaDivider} aria-hidden="true" />

                <MetaRow icon={<IconCalendar />} label="Criado em">
                  {criadoEm}
                </MetaRow>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
