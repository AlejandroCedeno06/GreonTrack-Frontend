import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { GoogleIcon } from '../components/icons';
import { PasswordStrength } from '../components/PasswordStrength';
import { evaluarFortaleza } from '../lib/passwordStrength';

export function Register() {
  const { signUp, signInWithGoogle, session } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!evaluarFortaleza(password).esValida) {
      setError('Tu contraseña no cumple con todos los requisitos de seguridad.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, nombre);
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }

    if (!session) {
      setSuccess('¡Cuenta creada! Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.');
      return;
    }

    navigate('/');
  };

  const handleGoogle = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  };

  return (
    <AuthLayout eyebrow="Comienza gratis">
      <h1 className="form-title">Crea tu cuenta</h1>
      <p className="form-subtitle">Configúrala en un minuto y empieza a monitorear hoy mismo.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            required
            autoComplete="name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
          />
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres, con mayúscula, número y símbolo"
          />
          <PasswordStrength password={password} />
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !evaluarFortaleza(password).esValida || password !== confirmPassword}
        >
          {loading ? 'Creando cuenta…' : 'Registrarme'}
        </button>
      </form>

      <div className="auth-divider">
        <span>o</span>
      </div>

      <button type="button" className="btn-google" onClick={handleGoogle}>
        <GoogleIcon /> Registrarme con Google
      </button>

      <p className="auth-footer">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
}
