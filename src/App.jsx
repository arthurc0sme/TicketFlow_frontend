import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetails from "./pages/TicketDetails";

function App() {
  const {
    isLoading: carregando,
    isAuthenticated: autenticado,
    error: erro,
    loginWithRedirect: login,
    user: usuario,
  } = useAuth0();

  const registrar = () => login({ authorizationParams: { screen_hint: "signup" } });

  if (carregando) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-app)' }}>
        <h2 style={{ color: 'var(--color-text-secondary)' }}>Carregando TicketFlow...</h2>
      </div>
    );
  }

  if (erro) {
    return <div>Erro na autenticação: {erro.message}</div>;
  }

  // envelopando as rotas da aplicacao pra garantir a seguranca via auth0
  return autenticado ? (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard user={usuario} />} />
        <Route path="/tickets" element={<Tickets user={usuario} />} />
        <Route path="/ticket/:id" element={<TicketDetails user={usuario} />} /> 
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  ) : (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--color-bg-app)' 
    }}>
      <h1 style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>TicketFlow</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
        Faça login para acessar a Fila de Atendimentos.
      </p>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <button 
          onClick={login}
          style={{
            padding: '10px 24px',
            backgroundColor: 'var(--color-brand-primary)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'bold'
          }}
        >
          Entrar no Sistema
        </button>
        <button 
          onClick={registrar}
          style={{
            padding: '10px 24px',
            backgroundColor: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'bold'
          }}
        >
          Criar Conta
        </button>
      </div>
    </div>
  );
}

export default App;