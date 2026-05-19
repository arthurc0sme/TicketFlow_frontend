import StatusBadge from './StatusBadge';
import styles from './TicketCard.module.css';

// mapa de prioridades que traduz o id da categoria salvo no banco para a exibicao visual na tela
const MAPA_PRIORIDADES = {
  1:  { label: 'Alta',  variant: 'high'   },
  2:  { label: 'Média', variant: 'medium' },
  3:  { label: 'Baixa', variant: 'low'    },
};

function resolverPrioridade(idCategoria) {
  return MAPA_PRIORIDADES[Number(idCategoria)] ?? { label: '—', variant: 'unknown' };
}

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

function Avatar({ nome }) {
  if (!nome) return null;
  const iniciais = nome
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <span className={styles.avatar} aria-label={nome} title={nome}>
      {iniciais}
    </span>
  );
}

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
  const prioridade = resolverPrioridade(idCategoria);
  const labelProtocolo = protocolo !== undefined ? `#${protocolo}` : null;

  return (
    <article
      className={styles.card}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      aria-label={`Ticket ${labelProtocolo ?? ''}: ${titulo}`}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{titulo}</h3>
        <span className={`${styles.priorityBadge} ${styles[`priority-${prioridade.variant}`]}`}>
          {prioridade.label}
        </span>
      </div>

      {descricao && (
        <p className={styles.description}>{descricao}</p>
      )}

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
            <Avatar nome={responsavel} />
            <span className={styles.responsavelName}>{responsavel}</span>
          </div>
        )}
      </div>
    </article>
  );
}