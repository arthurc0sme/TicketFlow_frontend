import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TicketCard from '../components/TicketCard';
import styles from './Tickets.module.css';

/* ══════════════════════════════════════════════════════════════
   MOCK DATA
   Keys match the backend contract: id, protocolo, titulo,
   descricao, status, idCategoria, tempoRestanteSLA, responsavel
   ══════════════════════════════════════════════════════════════ */
const MOCK_TICKETS = [
  {
    id: 1,
    protocolo: 1,
    titulo: 'Erro no sistema de pagamento',
    descricao: 'Usuários relatando falha ao processar pagamentos via cartão de crédito. O erro ocorre após inserir os dados do cartão e clicar em finalizar compra.',
    status: 'Criado',
    idCategoria: 1,
    tempoRestanteSLA: '2h atrás',
    responsavel: 'Maria Silva',
  },
  {
    id: 2,
    protocolo: 2,
    titulo: 'Layout quebrado no mobile',
    descricao: 'Interface não está responsiva em dispositivos iOS Safari. Botões ficam fora da tela e texto sobrepõe imagens.',
    status: 'Resposta 1',
    idCategoria: 3,
    tempoRestanteSLA: '5h atrás',
    responsavel: 'João Santos',
  },
  {
    id: 3,
    protocolo: 3,
    titulo: 'Solicitação de nova feature',
    descricao: 'Cliente solicitou integração com API do WhatsApp Business para envio automático de notificações de pedidos.',
    status: 'Em Análise',
    idCategoria: 5,
    tempoRestanteSLA: '1d atrás',
    responsavel: 'Ana Costa',
  },
  {
    id: 4,
    protocolo: 4,
    titulo: 'Performance lenta no dashboard',
    descricao: 'Carregamento dos gráficos está demorando mais de 10 segundos. Afeta principalmente usuários com muitos dados históricos.',
    status: 'Criado',
    idCategoria: 1,
    tempoRestanteSLA: '3h atrás',
    responsavel: null,
  },
  {
    id: 5,
    protocolo: 5,
    titulo: 'Dúvida sobre documentação',
    descricao: 'Como configurar webhooks para eventos de usuário? A documentação atual não deixa claro quais são os endpoints disponíveis.',
    status: 'Aguardando Cliente',
    idCategoria: 5,
    tempoRestanteSLA: '6h atrás',
    responsavel: 'Pedro Lima',
  },
  {
    id: 6,
    protocolo: 6,
    titulo: 'Bug na exportação de relatórios',
    descricao: 'Ao exportar relatórios em PDF, os gráficos não aparecem corretamente. Apenas tabelas são exibidas.',
    status: 'Criado',
    idCategoria: 3,
    tempoRestanteSLA: '4h atrás',
    responsavel: null,
  },
  {
    id: 7,
    protocolo: 7,
    titulo: 'Atualização de segurança necessária',
    descricao: 'Biblioteca de autenticação precisa ser atualizada devido à vulnerabilidade CVE-2026-1234.',
    status: 'Em Análise',
    idCategoria: 1,
    tempoRestanteSLA: '1d atrás',
    responsavel: 'Maria Silva',
  },
  {
    id: 8,
    protocolo: 8,
    titulo: 'Melhoria no filtro de busca',
    descricao: 'Adicionar opção de busca por múltiplos campos simultaneamente (nome, email, ID do pedido).',
    status: 'Criado',
    idCategoria: 5,
    tempoRestanteSLA: '2d atrás',
    responsavel: null,
  },
  /* Extra tickets to make sidebar queues visually meaningful */
  {
    id: 9,
    protocolo: 9,
    titulo: 'Falha no envio de e-mails transacionais',
    descricao: 'E-mails de confirmação de pedido não estão sendo entregues. Clientes reclamam de não receber comprovantes.',
    status: 'Resolvido',
    idCategoria: 1,
    tempoRestanteSLA: '2d atrás',
    responsavel: 'João Santos',
  },
  {
    id: 10,
    protocolo: 10,
    titulo: 'Integração com ERP descontinuada',
    descricao: 'A integração com o ERP legado parou de funcionar após a atualização do endpoint de autenticação.',
    status: 'Fechado',
    idCategoria: 3,
    tempoRestanteSLA: '5d atrás',
    responsavel: 'Ana Costa',
  },
  {
    id: 11,
    protocolo: 11,
    titulo: 'Erro 500 na API de relatórios',
    descricao: 'Endpoint /api/relatorios retorna 500 quando o período selecionado é superior a 90 dias.',
    status: 'Criado',
    idCategoria: 1,
    tempoRestanteSLA: '1h atrás',
    responsavel: 'João Santos',
  },
  {
    id: 12,
    protocolo: 12,
    titulo: 'Solicitação de acesso ao painel admin',
    descricao: 'Novo colaborador do time financeiro precisa de acesso ao módulo de relatórios administrativos.',
    status: 'Aguardando Cliente',
    idCategoria: 5,
    tempoRestanteSLA: '3h atrás',
    responsavel: null,
  },
];

/* ══════════════════════════════════════════════════════════════
   CURRENT USER (mock)
   ─────────────────────────────────────────────────────────────
   In production, replace this with the value from your Auth0
   context: const { user } = useAuth0();
   and use user.name or a custom claim like user['app/responsavel']
   ══════════════════════════════════════════════════════════════ */
const CURRENT_USER = 'João Santos';

/* ══════════════════════════════════════════════════════════════
   INACTIVE STATUSES
   Centralised so the 'department' queue exclusion and any future
   "active only" filter stay in sync with a single source of truth.
   ══════════════════════════════════════════════════════════════ */
const INACTIVE_STATUSES = new Set(['Resolvido', 'Fechado', 'Confirmado']);

/* ══════════════════════════════════════════════════════════════
   QUEUE PREDICATES
   ─────────────────────────────────────────────────────────────
   Each key matches a sidebar nav item `id`. The value is a pure
   predicate function (ticket) => boolean.

   SWAP STRATEGY (FastAPI migration):
   ─────────────────────────────────────────────────────────────
   When connecting to the backend, replace the local array filter
   with a fetch inside a useEffect that watches `activeQueue`:

     useEffect(() => {
       setLoading(true);
       fetch(`/api/tickets?queue=${activeQueue}`)
         .then(r => r.json())
         .then(data => setQueueTickets(data))
         .finally(() => setLoading(false));
     }, [activeQueue]);

   The predicate map below can then be deleted entirely — the
   server will own this logic. The rest of the component
   (search, priority/status filters, grid rendering) stays
   unchanged because they operate on `queueTickets`, not
   directly on MOCK_TICKETS.
   ══════════════════════════════════════════════════════════════ */
const QUEUE_PREDICATES = {
  /** All active tickets — excludes Resolvido / Fechado / Confirmado */
  department: (t) => !INACTIVE_STATUSES.has(t.status),

  /** Tickets not yet assigned to any technician */
  unassigned: (t) => t.responsavel === null,

  /** Tickets assigned to the currently logged-in technician */
  mine: (t) => t.responsavel === CURRENT_USER,

  /** Tickets waiting for the user/customer to respond */
  waiting: (t) => t.status === 'Aguardando Cliente',

  /** Tickets marked as resolved */
  resolved: (t) => t.status === 'Resolvido',

  /** Tickets formally closed or confirmed by the customer */
  confirmed: (t) => t.status === 'Fechado' || t.status === 'Confirmado',
};

/**
 * applyQueueFilter
 * ─────────────────
 * Applies the predicate for the active sidebar queue.
 * Falls back to 'department' (show all active) for any unknown key.
 *
 * This is the single function you'll remove when migrating to the
 * API — the fetch result already arrives pre-filtered.
 *
 * @param {object[]} tickets  — full local ticket array
 * @param {string}   queue    — sidebar item id (activePage state)
 * @returns {object[]}        — subset of tickets matching the queue
 */
function applyQueueFilter(tickets, queue) {
  const predicate = QUEUE_PREDICATES[queue] ?? QUEUE_PREDICATES.department;
  return tickets.filter(predicate);
}

/* ══════════════════════════════════════════════════════════════
   QUEUE META  (label + subtitle shown in the page header)
   ══════════════════════════════════════════════════════════════ */
const QUEUE_META = {
  department: { label: 'Tickets do Departamento', subtitle: 'Todos os chamados ativos do departamento' },
  unassigned: { label: 'Sem Técnico',             subtitle: 'Chamados ainda não atribuídos a um técnico' },
  mine:       { label: 'Meus Tickets',            subtitle: `Chamados atribuídos a ${CURRENT_USER}`      },
  waiting:    { label: 'Aguardando Resposta',      subtitle: 'Chamados aguardando retorno do solicitante' },
  resolved:   { label: 'Resolvidos',              subtitle: 'Chamados concluídos pela equipe técnica'    },
  confirmed:  { label: 'Confirmados',             subtitle: 'Chamados encerrados e confirmados pelo usuário' },
};

/* ══════════════════════════════════════════════════════════════
   FILTER OPTIONS
   ══════════════════════════════════════════════════════════════ */

/* Priority label map — mirrors TicketCard's internal CATEGORY_PRIORITY_MAP */
const PRIORITY_LABEL = {
  1: 'Alta',  2: 'Alta',
  3: 'Média', 4: 'Média',
  5: 'Baixa', 6: 'Baixa', 7: 'Baixa',
};

const PRIORITY_OPTIONS = [
  { value: '',      label: 'Todas prioridades' },
  { value: 'Alta',  label: 'Alta'  },
  { value: 'Média', label: 'Média' },
  { value: 'Baixa', label: 'Baixa' },
];

const STATUS_OPTIONS = [
  { value: '',                   label: 'Todos status'        },
  { value: 'Criado',             label: 'Criado'              },
  { value: 'Em Análise',         label: 'Em Análise'          },
  { value: 'Resposta',           label: 'Resposta'            },
  { value: 'Aguardando Cliente', label: 'Aguardando Cliente'  },
  { value: 'Resolvido',          label: 'Resolvido'           },
  { value: 'Fechado',            label: 'Fechado'             },
];

/* ══════════════════════════════════════════════════════════════
   ICONS
   ══════════════════════════════════════════════════════════════ */
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════ */
export default function Tickets() {
  const navigate = useNavigate();

  /* Active sidebar queue — drives the first layer of filtering */
  const [activePage,     setActivePage]     = useState('department');

  /* UI filter controls — applied on top of the queue result */
  const [searchQuery,    setSearchQuery]    = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');

  /* Reset UI filters whenever the queue changes so the user
     never lands on an empty grid due to a stale filter state. */
  function handleQueueChange(queue) {
    setActivePage(queue);
    setSearchQuery('');
    setFilterPriority('');
    setFilterStatus('');
  }

  /* ── Two-layer filtering ─────────────────────────────────────
     Layer 1 — Queue predicate (sidebar selection)
       Produces `queueTickets`: the subset this queue "owns".
       → Future: replaced entirely by a fetch result.

     Layer 2 — UI filters (search, priority, status dropdowns)
       Applied on top of `queueTickets` in the same useMemo so
       both layers re-run together when any dependency changes.
       → Stays client-side even after the API migration, because
         the dropdowns are a UX convenience, not a server concern.
     ────────────────────────────────────────────────────────── */
  const filteredTickets = useMemo(() => {
    /* ── Layer 1: queue ── */
    const queueTickets = applyQueueFilter(MOCK_TICKETS, activePage);
    /*
      FUTURE SWAP POINT:
      When using the API, `queueTickets` will come from state
      populated by a useEffect fetch, not from this call.
      Remove the line above and read from that state instead:
        const queueTickets = apiTickets;  // useState([])
    */

    /* ── Layer 2: search + dropdown filters ── */
    const q = searchQuery.trim().toLowerCase();

    return queueTickets.filter((ticket) => {
      const matchesSearch =
        !q ||
        ticket.titulo.toLowerCase().includes(q) ||
        ticket.descricao.toLowerCase().includes(q) ||
        String(ticket.protocolo).includes(q);

      const matchesPriority =
        !filterPriority ||
        PRIORITY_LABEL[ticket.idCategoria] === filterPriority;

      /* startsWith handles 'Resposta' matching 'Resposta 1', etc. */
      const matchesStatus =
        !filterStatus ||
        ticket.status.toLowerCase().startsWith(filterStatus.toLowerCase());

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [activePage, searchQuery, filterPriority, filterStatus]);

  /* Resolve page header copy for the active queue */
  const queueMeta = QUEUE_META[activePage] ?? QUEUE_META.department;

  return (
    <div className={styles.layout}>
      {/* ── Fixed sidebar ── */}
      <Sidebar
        activeItem={activePage}
        onNavigate={handleQueueChange}
        userEmail="demo@demo.com.br"
        userRole="tech"
      />

      {/* ── Scrollable main ── */}
      <main className={styles.main}>
        {/* Page header — reflects the active queue */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{queueMeta.label}</h1>
          <p className={styles.pageSubtitle}>{queueMeta.subtitle}</p>
        </header>

        {/* ── Action bar: search + filters ── */}
        <div className={styles.actionBar}>
          {/* Search */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><IconSearch /></span>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Buscar tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar tickets"
            />
          </div>

          {/* Filter funnel */}
          <span className={styles.filterIcon} aria-hidden="true"><IconFilter /></span>

          {/* Priority select */}
          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              aria-label="Filtrar por prioridade"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className={styles.selectChevron}><IconChevron /></span>
          </div>

          {/* Status select */}
          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filtrar por status"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className={styles.selectChevron}><IconChevron /></span>
          </div>
        </div>

        {/* Queue result count */}
        <p className={styles.resultCount} role="status" aria-live="polite">
          {filteredTickets.length === 0
            ? 'Nenhum ticket encontrado'
            : `${filteredTickets.length} ticket${filteredTickets.length !== 1 ? 's' : ''}`}
        </p>

        {/* ── Ticket grid ── */}
        {filteredTickets.length > 0 ? (
          <div className={styles.grid} role="list" aria-label="Lista de tickets">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} role="listitem">
                <TicketCard
                  protocolo={ticket.protocolo}
                  titulo={ticket.titulo}
                  descricao={ticket.descricao}
                  idCategoria={ticket.idCategoria}
                  statusAtual={ticket.status}
                  tempoRestanteSLA={ticket.tempoRestanteSLA}
                  responsavel={ticket.responsavel}
                  onClick={() => navigate(`/ticket/${ticket.id}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState} role="status">
            <span className={styles.emptyIcon} aria-hidden="true">
              <IconSearch />
            </span>
            <p className={styles.emptyTitle}>Nenhum ticket encontrado</p>
            <p className={styles.emptyHint}>
              {searchQuery || filterPriority || filterStatus
                ? 'Tente ajustar os filtros ou a busca.'
                : 'Esta fila está vazia no momento.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
