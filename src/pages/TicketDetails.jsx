import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import styles from './TicketDetails.module.css';

// simulando a resposta da api enquanto o backend nao ta integrado pra pagina renderizar
const MOCK_CHAMADOS_BD = {
  1: {
    id: 1, protocolo: 1, ano: 2026,
    titulo: 'Erro no sistema de pagamento',
    descricao: 'Usuários relatando falha ao processar pagamentos via cartão de crédito. O erro ocorre após inserir os dados do cartão e clicar em finalizar compra.',
    status: 'Em Análise', idCategoria: 1,
    responsavel: 'João Santos', solicitante: 'Maria Silva',
    departamento: 'Financeiro',
    criadoEm: '2026-04-13T14:30:00',
    slaTipo: 'TA - Tempo de Atualização',
    // calculo isolado pra garantir que o deadline de sla seja gerado sempre no futuro pra tela sempre demonstrar valores corretos na apresentacao
    slaDeadline: (() => { const d = new Date(); d.setSeconds(d.getSeconds() + 1800); return d.toISOString(); })(),
    anexos: [
      { name: 'print_erro_checkout.png', size: '1.2 MB', type: 'PNG' },
      { name: 'log_console_navegador.txt', size: '15 KB', type: 'TXT' }
    ],
    history: [
      { id: 'h1', type: 'created',  title: 'Ticket criado', tags: ['criado'], actor: 'Maria Silva', timestamp: '2026-04-13 14:30', note: 'Usuários relatando falha ao processar pagamentos via cartão de crédito. O erro ocorre após inserir os dados do cartão e clicar em finalizar compra.' },
      { id: 'h2', type: 'assigned', title: 'Ticket atribuído para @João Santos', tags: [], actor: 'Sistema', timestamp: '2026-04-13 14:35' },
      { id: 'h3', type: 'status',   title: 'Status alterado', tags: ['criado', 'em_analise'], actor: 'João Santos', timestamp: '2026-04-13 14:36', statusArrow: true },
      { id: 'h4', type: 'comment',  title: 'Comentário adicionado', tags: [], actor: 'João Santos', timestamp: '2026-04-13 15:02', note: 'Reproduzi o erro em ambiente de staging. Aguardando acesso ao log do gateway.' },
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
    anexos: [],
    history: [
      { id: 'h1', type: 'created',  title: 'Ticket criado',       tags: ['criado'],    actor: null,         timestamp: '2026-04-13 09:00' },
      { id: 'h2', type: 'assigned', title: 'Atribuído para @Ana Costa', tags: [],      actor: 'Pedro Lima', timestamp: '2026-04-13 09:15' },
    ],
  },
};

const CHAMADO_FALLBACK = {
  id: 0, protocolo: 0, ano: 2026,
  titulo: 'Ticket não encontrado',
  descricao: 'Este chamado não existe ou foi removido.',
  status: 'Criado', idCategoria: 5,
  responsavel: '—', solicitante: '—', departamento: '—',
  criadoEm: new Date().toISOString(),
  slaDeadline: new Date().toISOString(),
  anexos: [],
  history: [],
};

const MAPA_PRIORIDADES = {
  1: { label: 'Alta',  variant: 'high'   },
  2: { label: 'Alta',  variant: 'high'   },
  3: { label: 'Média', variant: 'medium' },
  4: { label: 'Média', variant: 'medium' },
  5: { label: 'Baixa', variant: 'low'    },
  6: { label: 'Baixa', variant: 'low'    },
  7: { label: 'Baixa', variant: 'low'    },
};

function Svg({ size = 16, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" {...rest}
    >{children}</svg>
  );
}

const IconArrowLeft = () => <Svg size={16}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Svg>;
const IconClock = () => <Svg size={14}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>;
const IconUser = () => <Svg size={14}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Svg>;
const IconTag = () => <Svg size={14}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></Svg>;
const IconBuilding = () => <Svg size={14}><rect x="4" y="2" width="16" height="20"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><rect x="9" y="7" width="2" height="2"/><rect x="13" y="7" width="2" height="2"/><rect x="9" y="12" width="6" height="10"/></Svg>;
const IconHash = () => <Svg size={14}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></Svg>;
const IconCalendar = () => <Svg size={14}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Svg>;
const IconSend = () => <Svg size={15} strokeWidth="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Svg>;
const IconLock = () => <Svg size={15}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Svg>;
const IconGlobe = () => <Svg size={15}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Svg>;

// Novos ícones
const IconFileImage = () => <Svg size={20} strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></Svg>;
const IconFileText = () => <Svg size={20} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></Svg>;
const IconDownload = () => <Svg size={15} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Svg>;
const IconMail = () => <Svg size={15} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></Svg>;
const IconClip = () => <Svg size={15} strokeWidth="2.2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></Svg>;

function TimelineIcon({ type }) {
  if (type === 'created')  return <Svg size={15}><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></Svg>;
  if (type === 'assigned') return <Svg size={15}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Svg>;
  if (type === 'status')   return <Svg size={15}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>;
  if (type === 'comment')  return <Svg size={15}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Svg>;
  return null;
}

// hook customizado pra calcular a regressiva do sla em tempo real
function usarCronometroSla(prazoIso) {
  const calcularRestante = useCallback(() => {
    const diferenca = Math.max(0, new Date(prazoIso) - Date.now());
    const totalSegundos = Math.floor(diferenca / 1000);
    return {
      horas:   Math.floor(totalSegundos / 3600),
      minutos: Math.floor((totalSegundos % 3600) / 60),
      segundos: totalSegundos % 60,
      total:   totalSegundos,
      expirado: diferenca <= 0,
    };
  }, [prazoIso]);

  const [restante, setRestante] = useState(calcularRestante);

  useEffect(() => {
    const id = setInterval(() => setRestante(calcularRestante()), 1000);
    return () => clearInterval(id);
  }, [calcularRestante]);

  const urgencia =
    restante.expirado || restante.total <= 900  ? 'critical' :  
    restante.total    <= 3600                   ? 'warning'  :  
    'ok';

  return { ...restante, urgencia };
}

function PriorityBadge({ idCategoria }) {
  const prioridade = MAPA_PRIORIDADES[Number(idCategoria)] ?? { label: '—', variant: 'unknown' };
  return (
    <span className={`${styles.priorityBadge} ${styles[`priority-${prioridade.variant}`]}`}>
      {prioridade.label}
    </span>
  );
}

function MetaRow({ icon, label, children }) {
  return (
    <div className={styles.metaRow}>
      <span className={styles.metaIcon}>{icon}</span>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{children}</span>
    </div>
  );
}

function SlaCard({ slaDeadline, slaTipo, label = 'SLA de Atualização' }) {
  const { horas, minutos, segundos, urgencia, expirado } = usarCronometroSla(slaDeadline);

  const formatarNumero = (n) => String(n).padStart(2, '0');

  return (
    <div className={`${styles.slaCard} ${styles[`sla-${urgencia}`]}`}>
      <p className={styles.slaLabel}>{label}</p>

      {expirado ? (
        <p className={`${styles.slaTime} ${styles[`slaTime-${urgencia}`]}`}>
          Expirado
        </p>
      ) : (
        <p className={`${styles.slaTime} ${styles[`slaTime-${urgencia}`]}`} aria-live="polite" aria-atomic="true">
          {formatarNumero(horas)}h {formatarNumero(minutos)}m{' '}
          <span className={styles.slaSeconds}>{formatarNumero(segundos)}s</span>
        </p>
      )}

      {slaTipo && (
        <span className={styles.slaTypeLabel} title={slaTipo}>
          {slaTipo}
        </span>
      )}

      <p className={`${styles.slaHint} ${styles[`slaHint-${urgencia}`]}`}>
        {urgencia === 'ok'       && 'Dentro do prazo'}
        {urgencia === 'warning'  && '⚠ Atenção — menos de 1 hora'}
        {urgencia === 'critical' && (expirado ? '✕ SLA expirado' : '⚠ Crítico — menos de 15 minutos')}
      </p>
    </div>
  );
}

function TimelineItem({ event, ehUltimo }) {
  return (
    <li className={`${styles.timelineItem} ${ehUltimo ? styles.timelineItemLast : ''}`}>
      <div className={styles.timelineIconWrap} aria-hidden="true">
        <span className={`${styles.timelineIconCircle} ${styles[`tIcon-${event.type}`]}`}>
          <TimelineIcon type={event.type} />
        </span>
        {!ehUltimo && <span className={styles.timelineConnector} />}
      </div>

      <div className={styles.timelineContent}>
        <div className={styles.timelineHeader}>
          <span className={styles.timelineTitle}>{event.title}</span>
          <time className={styles.timelineTime} dateTime={event.timestamp}>
            {event.timestamp}
          </time>
        </div>

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

        {event.note && (
          <p className={styles.timelineNote}>{event.note}</p>
        )}

        {event.actor && (
          <span className={styles.timelineActor}>{event.actor}</span>
        )}
      </div>
    </li>
  );
}

// Novo componente para a transferência de departamento
function DepartmentTransferBar({ currentDepartment, onTransfer }) {
  const [selectedDept, setSelectedDept] = useState(currentDepartment);
  const options = ['Financeiro', 'Produto', 'Suporte N1', 'Infraestrutura'];

  function handleSave() {
    if (selectedDept !== currentDepartment) {
      onTransfer(selectedDept);
    }
  }

  return (
    <div className={styles.commentBar}>
      <span className={styles.metaIcon}>
        <IconBuilding />
      </span>
      <select
        className={styles.transferSelect}
        value={selectedDept}
        onChange={(e) => setSelectedDept(e.target.value)}
        aria-label="Selecionar departamento"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <button
        className={styles.sendBtn}
        onClick={handleSave}
        disabled={selectedDept === currentDepartment}
        aria-label="Salvar novo departamento"
      >
        <span>Salvar</span>
      </button>
    </div>
  );
}

// componente para a nova listagem de anexos
function AttachmentsCard({ anexos }) {
  if (!anexos || anexos.length === 0) return null;

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Anexos</h2>
      <ul className={styles.attachmentsList}>
        {anexos.map((anexo, idx) => (
          <li key={idx} className={styles.attachmentItem}>
            <div className={styles.attachmentIconWrap}>
              {anexo.type === 'PNG' || anexo.type === 'JPG' || anexo.type === 'JPEG' 
                ? <IconFileImage /> 
                : <IconFileText />}
            </div>
            <div className={styles.attachmentInfo}>
              <span className={styles.attachmentName} title={anexo.name}>
                {anexo.name}
              </span>
              <span className={styles.attachmentMeta}>
                {anexo.size} • {anexo.type}
              </span>
            </div>
            <button className={styles.downloadBtn} aria-label={`Baixar ${anexo.name}`}>
              <IconDownload />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// segrega a interface pra garantir regras de compliance onde apenas a equipe tecnica le essa caixa
function InternalNote() {
  const [nota, setNota] = useState('');
  const [salvo, setSalvo] = useState(false);
  const LIMITE_CARACTERES = 1000;

  function salvarNota() {
    if (!nota.trim()) return;
    
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
    setNota('');
  }

  return (
    <div className={styles.noteCard}>
      <div className={styles.noteHeader}>
        <span className={styles.noteHeaderIcon}>
          <IconLock />
        </span>
        <div>
          <h3 className={styles.noteTitle}>Nota Interna</h3>
          <p className={styles.noteSubtitle}>Visível apenas para a equipe técnica</p>
        </div>
      </div>

      <div className={styles.noteTextareaWrap}>
        <textarea
          className={styles.noteTextarea}
          placeholder="Adicione uma nota interna sobre este chamado…"
          value={nota}
          onChange={(e) => setNota(e.target.value.slice(0, LIMITE_CARACTERES))}
          rows={5}
          aria-label="Nota interna"
        />
        <span className={`${styles.noteCharCount} ${nota.length >= LIMITE_CARACTERES * 0.9 ? styles.noteCharCountWarn : ''}`}>
          {nota.length}/{LIMITE_CARACTERES}
        </span>
      </div>

      <div className={styles.noteFooter}>
        {salvo && (
          <span className={styles.noteSavedFeedback} role="status" aria-live="polite">
            ✓ Nota salva
          </span>
        )}
        <button
          className={styles.noteSaveBtn}
          onClick={salvarNota}
          disabled={!nota.trim()}
          aria-label="Salvar nota interna"
        >
          Salvar Nota
        </button>
      </div>
    </div>
  );
}

// resposta publica padrao que vai pro email do usuario, agora recebendo prop functions
function PublicReply({ onSendSolution, onAddAttachment }) {
  const [resposta, setResposta] = useState('');
  const [enviado, setEnviado]   = useState(false);
  const LIMITE_CARACTERES = 2000;

  function enviarResposta() {
    if (!resposta.trim()) return;
    
    setEnviado(true);
    setTimeout(() => setEnviado(false), 2500);
    setResposta('');
  }

  return (
    <div className={styles.replyCard}>
      <div className={styles.replyHeader}>
        <span className={styles.replyHeaderIcon}>
          <IconGlobe />
        </span>
        <div>
          <h3 className={styles.replyTitle}>Resposta ao Usuário</h3>
          <p className={styles.replySubtitle}>Será enviada por e-mail ao solicitante</p>
        </div>
      </div>

      <div className={styles.replyTextareaWrap}>
        <textarea
          className={styles.replyTextarea}
          placeholder="Escreva sua resposta ao usuário…"
          value={resposta}
          onChange={(e) => setResposta(e.target.value.slice(0, LIMITE_CARACTERES))}
          rows={5}
          aria-label="Resposta ao usuário"
        />
        <span className={`${styles.replyCharCount} ${resposta.length >= LIMITE_CARACTERES * 0.9 ? styles.replyCharCountWarn : ''}`}>
          {resposta.length}/{LIMITE_CARACTERES}
        </span>
      </div>

      <div className={styles.replyFooter}>
        <button 
          className={styles.replyAttachBtn}
          onClick={onAddAttachment}
          aria-label="Adicionar anexo"
          type="button"
        >
          <IconClip />
          Adicionar Anexo
        </button>

        <div className={styles.replyFooterActions}>
          {enviado && (
            <span className={styles.replySentFeedback} role="status" aria-live="polite">
              ✓ Resposta enviada
            </span>
          )}
          <button
            className={styles.replySendBtn}
            onClick={enviarResposta}
            disabled={!resposta.trim()}
            aria-label="Enviar resposta ao usuário"
          >
            <IconSend />
            Enviar Resposta
          </button>
          
          <button
            className={styles.replySolutionBtn}
            onClick={onSendSolution}
            aria-label="Enviar solução e resolver"
            type="button"
            disabled={!resposta.trim()}
          >
            <IconMail />
            Enviar Solução
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TicketDetails({ user }) {
  const { id }   = useParams();
  const navigate = useNavigate();

  const chamado = MOCK_CHAMADOS_BD[Number(id)] ?? CHAMADO_FALLBACK;
  
  // Gerenciando estados locais pro mock da apresentação ficar reativo
  const [currentStatus, setCurrentStatus] = useState(chamado.status);
  const [currentHistory, setCurrentHistory] = useState(chamado.history);
  const [currentDepartment, setCurrentDepartment] = useState(chamado.departamento);

  const protocoloFormatado = `${String(chamado.protocolo).padStart(3, '0')}/${chamado.ano}`;
  const criadoEm = new Date(chamado.criadoEm).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const handleSendSolution = () => {
    setCurrentStatus('Resolvido');
    
    // Opcional: Adicionar um evento na timeline para a solução (ficar mais realista)
    const newEvent = {
      id: `h_sol_${Date.now()}`,
      type: 'status',
      title: 'Status alterado',
      tags: ['em_analise', 'resolvido'],
      actor: user?.email || 'Técnico',
      timestamp: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
      statusArrow: true,
      note: 'Solução enviada aguardando validação do cliente.'
    };
    setCurrentHistory((prev) => [...prev, newEvent]);
  };

  const handleAddAttachment = () => {
    const newEvent = {
      id: `h_att_${Date.now()}`,
      type: 'comment',
      title: 'Anexo adicionado',
      tags: [],
      actor: user?.email || 'Técnico',
      timestamp: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
      note: 'Arquivo anexado: comprovante_ajuste.pdf (2.4 MB)'
    };
    setCurrentHistory((prev) => [...prev, newEvent]);
  };

  const handleTransferDepartment = (newDept) => {
    const oldDept = currentDepartment;
    setCurrentDepartment(newDept);
    
    const newEvent = {
      id: `h_transf_${Date.now()}`,
      type: 'status',
      title: 'Departamento alterado',
      tags: [],
      actor: user?.email || 'Técnico',
      timestamp: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
      note: `Chamado transferido de ${oldDept} para ${newDept}.`
    };
    setCurrentHistory((prev) => [...prev, newEvent]);
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        activeItem="mine"
        onNavigate={(pagina) => navigate(`/${pagina === 'tickets' ? 'tickets' : ''}`)}
        userEmail={user?.email || "demo@demo.com.br"}
        userRole="tech"
      />

      <div className={styles.main}>
        <header className={styles.pageHeader}>
          <button
            className={styles.backBtn}
            onClick={() => navigate(-1)}
            aria-label="Voltar para chamados"
          >
            <IconArrowLeft />
            Voltar para chamados
          </button>
          <h1 className={styles.pageTitle}>{chamado.titulo}</h1>
        </header>

        <div className={styles.grid}>
          <aside className={styles.colLeft} aria-label="Comunicação do ticket">
            <InternalNote />
            <PublicReply 
              onSendSolution={handleSendSolution}
              onAddAttachment={handleAddAttachment}
            />
          </aside>

          <section className={styles.colCenter} aria-label="Histórico de atividades">
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Histórico de Atividades</h2>

              <ol className={styles.timeline}>
                {currentHistory.map((evento, i) => (
                  <TimelineItem
                    key={evento.id}
                    event={evento}
                    ehUltimo={i === currentHistory.length - 1}
                  />
                ))}
                {currentHistory.length === 0 && (
                  <li className={styles.emptyTimeline}>Nenhuma atividade registrada.</li>
                )}
              </ol>
            </div>

            <DepartmentTransferBar 
              currentDepartment={currentDepartment}
              onTransfer={handleTransferDepartment}
            />
          </section>

          <aside className={styles.colRight} aria-label="Detalhes e SLA">
            <SlaCard slaDeadline={chamado.slaDeadline} slaTipo={chamado.slaTipo} />

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Informações</h2>

              <div className={styles.metaList}>
                <MetaRow icon={<IconHash />} label="Protocolo">
                  <span className={styles.protocoloBadge}>{protocoloFormatado}</span>
                </MetaRow>

                <MetaRow icon={<IconTag />} label="Prioridade">
                  <PriorityBadge idCategoria={chamado.idCategoria} />
                </MetaRow>

                <MetaRow icon={<IconClock />} label="Status">
                  {/* Status renderizado a partir do state local */}
                  <StatusBadge status={currentStatus} size="sm" />
                </MetaRow>

                <div className={styles.metaDivider} aria-hidden="true" />

                <MetaRow icon={<IconUser />} label="Solicitante">
                  {chamado.solicitante}
                </MetaRow>

                <MetaRow icon={<IconUser />} label="Responsável">
                  {chamado.responsavel}
                </MetaRow>

                <MetaRow icon={<IconBuilding />} label="Departamento">
                  {currentDepartment}
                </MetaRow>

                <div className={styles.metaDivider} aria-hidden="true" />

                <MetaRow icon={<IconCalendar />} label="Criado em">
                  {criadoEm}
                </MetaRow>
              </div>
            </div>

            <AttachmentsCard anexos={chamado.anexos} />
          </aside>
        </div>
      </div>
    </div>
  );
}