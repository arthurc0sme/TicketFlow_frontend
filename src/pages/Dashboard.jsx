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
    descricao: 'Usuários relatando falha ao processar pagamentos via cartão de crédito...',
    status: 'Criado',
    idCategoria: 1,
    tempoRestanteSLA: '2h atrás',
    responsavel: null,
  },
  {
    id: 2,
    protocolo: 2,
    titulo: 'Layout quebrado no mobile',
    descricao: 'Interface não está responsiva em dispositivos iOS Safari...',
    status: 'Resposta 1',
    idCategoria: 3,
    tempoRestanteSLA: '5h atrás',
    responsavel: null,
  },
  {
    id: 3,
    protocolo: 3,
    titulo: 'Solicitação de nova feature',
    descricao: 'Cliente solicitou integração com API do WhatsApp Business...',
    status: 'Em Análise',
    idCategoria: 5,
    tempoRestanteSLA: '1d atrás',
    responsavel: null,
  },
  {
    id: 4,
    protocolo: 4,
    titulo: 'Performance lenta no dashboard',
    descricao: 'Carregamento dos gráficos está demorando mais de 10 segundos...',
    status: 'Criado',
    idCategoria: 1,
    tempoRestanteSLA: '3h atrás',
    responsavel: null,
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
          <p className={styles.pageSubtitle}>Visão geral do sistema de tickets</p>
        </header>

        <section className={styles.statsRow} aria-label="Estatísticas gerais">
          <StatCard label="Pendentes"        value={pendentes}    trend="12%" />
          <StatCard label="Resolvidos"       value={resolvidos}   trend="8%"  />
          <StatCard label="Taxa de Resolução" value={taxaResolucao} trend="5%" />
        </section>

        <section className={styles.queueSection} aria-label="Fila de tickets">
          <div className={styles.queueHeader}>
            <h2 className={styles.queueTitle}>Fila de Tickets</h2>
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