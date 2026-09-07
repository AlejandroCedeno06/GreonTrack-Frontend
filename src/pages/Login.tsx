import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { GoogleIcon } from '../components/icons';

const COOLDOWN_REENVIO_SEGUNDOS = 30;

export function Login() {
  const { signIn, signInWithGoogle, verificarCodigo, reenviarCodigo } = useAuth();
  const navigate = useNavigate();

  const [paso, setPaso] = useState<'password' | 'codigo'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSubmitPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setPaso('codigo');
    setCooldown(COOLDOWN_REENVIO_SEGUNDOS);
  };

  const handleSubmitCodigo = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await verificarCodigo(email, codigo.trim());
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    navigate('/');
  };

  const handleReenviar = async () => {
    if (cooldown > 0) return;
    setError(null);
    const { error } = await reenviarCodigo(email);
    if (error) {
      setError(error);
      return;
    }
    setCooldown(COOLDOWN_REENVIO_SEGUNDOS);
  };

  const handleVolver = () => {
    setPaso('password');
    setCodigo('');
    setError(null);
  };

  const handleGoogle = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  };

  if (paso === 'codigo') {
    return (
      <AuthLayout eyebrow="Verificación en dos pasos">
        <h1 className="form-title">Revisa tu correo</h1>
        <p className="form-subtitle">
          Enviamos un código de acceso a <strong>{email}</strong>. Ingrésalo para entrar.
        </p>

        <form className="auth-form" onSubmit={handleSubmitCodigo}>
          <div className="field">
            <label htmlFor="codigo">Código de acceso</label>
            <input
              id="codigo"
              type="text"
              autoComplete="one-time-code"
              required
              maxLength={20}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Código del correo"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading || codigo.trim().length === 0}>
            {loading ? 'Verificando…' : 'Verificar y entrar'}
          </button>
        </form>

        <p className="auth-footer">
          <button type="button" className="link-button" onClick={handleVolver}>
            ‹ Volver
          </button>
          {' · '}
          <button type="button" className="link-button" onClick={handleReenviar} disabled={cooldown > 0}>
            {cooldown > 0 ? `Reenviar código (${cooldown}s)` : 'Reenviar código'}
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout eyebrow="Acceso seguro">
      <h1 className="form-title">Bienvenido de nuevo</h1>
      <p className="form-subtitle">Entra para revisar tu consumo, costo y huella de carbono.</p>

      <form className="auth-form" onSubmit={handleSubmitPassword}>
        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="auth-divider">
        <span>o</span>
      </div>

      <button type="button" className="btn-google" onClick={handleGoogle}>
        <GoogleIcon /> Continuar con Google
      </button>

      <p className="auth-footer">
        ¿No tienes cuenta? <Link to="/registro">Créala gratis</Link>
      </p>
    </AuthLayout>
  );
}
