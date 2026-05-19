import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Sidebar from '../components/Sidebar';
import TicketCard from '../components/TicketCard';
import styles from './Dashboard.module.css';

/* ── Mock data ─────────────────────────────────────────────── */
const MOCK_TICKETS = [
  {
    id: 1,
    protocolo: 1,
    titulo: 'Erro no sistema de pagamento',
    descricao: 'Usuários relatando falha ao processar pagamentos via cartão de crédito. O erro ocorre após inserir os dados do cartão e clicar em finalizar compra.',
    status: 'Em análise',
    idCategoria: 1,
    tempoRestanteSLA: '2h atrás',
    responsavel: 'João Santos',
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
    id: 7,
    protocolo: 7,
    titulo: 'Atualização de segurança necessária',
    descricao: 'Biblioteca de autenticação precisa ser atualizada devido à vulnerabilidade CVE-2026-1234.',
    status: 'Em Análise',
    idCategoria: 1,
    tempoRestanteSLA: '1d atrás',
    responsavel: 'Arthur Cosme',
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
];

/* ── Stat card ─────────────────────────────────────────────── */
function StatCard({ label, value, trend }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <span className={styles.statLabel}>{label}</span>
        {trend && (
          <span className={styles.statTrend} aria-label={`Variação: ${trend}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
            {trend}
          </span>
        )}
      </div>
      <p className={styles.statValue}>{value}</p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */

export default function Dashboard({ user }) {
  const [tickets] = useState(MOCK_TICKETS);
  const navigate = useNavigate();

  const pendentes  = tickets.filter((t) => t.status !== 'Resolvido' && t.status !== 'Fechado').length;
  const resolvidos = 156;
  const taxaResolucao = '87%';

  return (
    <div className={styles.layout}>
      {/* ── Fixed sidebar ── */}
      <Sidebar
        activeItem="dashboard"
        onNavigate={(page) => navigate('/tickets')} 
        userEmail={user?.email}
        userRole="tech"
      />

      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Dados e métricas</p>
        </header>

        <section className={styles.statsRow} aria-label="Estatísticas gerais">
          <StatCard label="Pendentes"        value={pendentes}    trend="12%" />
          <StatCard label="Resolvidos"       value={resolvidos}   trend="8%"  />
          <StatCard label="Taxa de Resolução" value={taxaResolucao} trend="5%" />
        </section>

        <section className={styles.queueSection} aria-label="Fila de tickets">
          <div className={styles.queueHeader}>
            <h2 className={styles.queueTitle}>Tickets Urgentes (Alta prioridade)</h2>
            <span className={styles.queueCount}>
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} ativos
            </span>
          </div>

          <div className={styles.queueCard}>
            {tickets.map((ticket, index) => (
              <div key={ticket.id}>
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
                {index < tickets.length - 1 && (
                  <div className={styles.ticketDivider} aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}