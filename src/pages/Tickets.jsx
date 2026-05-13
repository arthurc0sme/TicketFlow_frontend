import { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import TicketCard from '../components/TicketCard';
import TicketModal from '../components/TicketModal';
import styles from './Tickets.module.css';

/* ── Mocked ticket data ────────────────────────────────────── */
const MOCK_TICKETS = [
  {
    id: 1, protocolo: 1, titulo: 'Erro no sistema de pagamento',
    descricao: 'Usuários relatando falha ao processar pagamentos via cartão de crédito. O erro ocorre após inserir os dados do cartão e clicar em finalizar compra.',
    status: 'Criado', idCategoria: 1, tempoRestanteSLA: '2h atrás', responsavel: 'Maria Silva',
  },
  {
    id: 2, protocolo: 2, titulo: 'Layout quebrado no mobile',
    descricao: 'Interface não está responsiva em dispositivos iOS Safari. Botões ficam fora da tela e texto sobrepõe imagens.',
    status: 'Resposta 1', idCategoria: 3, tempoRestanteSLA: '5h atrás', responsavel: 'João Santos',
  },
  {
    id: 3, protocolo: 3, titulo: 'Solicitação de nova feature',
    descricao: 'Cliente solicitou integração com API do WhatsApp Business para envio automático de notificações de pedidos.',
    status: 'Em Análise', idCategoria: 5, tempoRestanteSLA: '1d atrás', responsavel: 'Ana Costa',
  },
  {
    id: 4, protocolo: 4, titulo: 'Performance lenta no dashboard',
    descricao: 'Carregamento dos gráficos está demorando mais de 10 segundos. Afeta principalmente usuários com muitos dados históricos.',
    status: 'Criado', idCategoria: 1, tempoRestanteSLA: '3h atrás', responsavel: null,
  },
  {
    id: 5, protocolo: 5, titulo: 'Dúvida sobre documentação',
    descricao: 'Como configurar webhooks para eventos de usuário? A documentação atual não deixa claro quais são os endpoints disponíveis.',
    status: 'Aguardando Cliente', idCategoria: 5, tempoRestanteSLA: '6h atrás', responsavel: 'Pedro Lima',
  },
  {
    id: 6, protocolo: 6, titulo: 'Bug na exportação de relatórios',
    descricao: 'Ao exportar relatórios em PDF, os gráficos não aparecem corretamente. Apenas tabelas são exibidas.',
    status: 'Criado', idCategoria: 3, tempoRestanteSLA: '4h atrás', responsavel: null,
  },
  {
    id: 7, protocolo: 7, titulo: 'Atualização de segurança necessária',
    descricao: 'Biblioteca de autenticação precisa ser atualizada devido à vulnerabilidade CVE-2026-1234.',
    status: 'Em Análise', idCategoria: 1, tempoRestanteSLA: '1d atrás', responsavel: 'Maria Silva',
  },
  {
    id: 8, protocolo: 8, titulo: 'Melhoria no filtro de busca',
    descricao: 'Adicionar opção de busca por múltiplos campos simultaneamente (nome, email, ID do pedido).',
    status: 'Criado', idCategoria: 5, tempoRestanteSLA: '2d atrás', responsavel: null,
  },
];

/* ── Priority label map ───────────────────────────────────── */
const PRIORITY_LABEL = {
  1: 'Alta', 2: 'Alta', 3: 'Média', 4: 'Média', 5: 'Baixa', 6: 'Baixa', 7: 'Baixa',
};

const PRIORITY_OPTIONS = [
  { value: '',      label: 'Todas prioridades' },
  { value: 'Alta',  label: 'Alta'  },
  { value: 'Média', label: 'Média' },
  { value: 'Baixa', label: 'Baixa' },
];

const STATUS_OPTIONS = [
  { value: '',                  label: 'Todos status'       },
  { value: 'Criado',            label: 'Criado'             },
  { value: 'Em Análise',        label: 'Em Análise'         },
  { value: 'Resposta 1',        label: 'Resposta'           },
  { value: 'Aguardando Cliente',label: 'Aguardando Cliente' },
  { value: 'Resolvido',         label: 'Resolvido'          },
];

/* ── Icons ───────────────────────────────────────────────── */
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

/* ────────────────────────────────────────────────────────── */

// Injetado: Recebendo a prop { user } do Auth0 no App.jsx
export default function Tickets({ user }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');

  /* ── Client-side filtering ───────────────────────────────── */
  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MOCK_TICKETS.filter((ticket) => {
      const matchesSearch =
        !q ||
        ticket.titulo.toLowerCase().includes(q) ||
        ticket.descricao.toLowerCase().includes(q) ||
        String(ticket.protocolo).includes(q);

      const matchesPriority =
        !filterPriority ||
        PRIORITY_LABEL[ticket.idCategoria] === filterPriority;

      const matchesStatus =
        !filterStatus ||
        ticket.status.toLowerCase().startsWith(filterStatus.toLowerCase());

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [searchQuery, filterPriority, filterStatus]);

  return (
    <div className={styles.layout}>
      {/* ── Fixed sidebar ── */}
      <Sidebar userEmail={user?.email} /> {/* Passando o email real */}

      {/* ── Scrollable main ── */}
      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Tickets</h1>
          <p className={styles.pageSubtitle}>Gerencie todos os tickets do sistema</p>
        </header>

        {/* ── Action bar: search + filters ── */}
        <div className={styles.actionBar}>
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

          <span className={styles.filterIcon} aria-hidden="true"><IconFilter /></span>

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
                  onClick={() => setSelectedTicket(ticket)}
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
            <p className={styles.emptyHint}>Tente ajustar os filtros ou a busca.</p>
          </div>
        )}
      </main>

      <TicketModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </div>
  );
}