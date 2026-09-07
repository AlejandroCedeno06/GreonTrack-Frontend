import { evaluarFortaleza, RequisitosPassword } from '../lib/passwordStrength';

interface PasswordStrengthProps {
  password: string;
}

const ETIQUETA_NIVEL: Record<string, string> = {
  debil: 'Débil',
  media: 'Media',
  fuerte: 'Fuerte',
};

const REQUISITOS: { key: keyof RequisitosPassword; label: string }[] = [
  { key: 'longitud', label: 'Al menos 8 caracteres' },
  { key: 'mayuscula', label: 'Una letra mayúscula' },
  { key: 'minuscula', label: 'Una letra minúscula' },
  { key: 'numero', label: 'Un número' },
  { key: 'especial', label: 'Un carácter especial (!@#$%...)' },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { requisitos, puntaje, nivel } = evaluarFortaleza(password);

  return (
    <div className="password-strength">
      <div className="password-strength-bar">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`password-strength-segment${i < puntaje ? ` nivel-${nivel}` : ''}`} />
        ))}
      </div>
      <span className={`password-strength-label nivel-${nivel}`}>Seguridad: {ETIQUETA_NIVEL[nivel]}</span>

      <ul className="password-requisitos">
        {REQUISITOS.map(({ key, label }) => (
          <li key={key} className={requisitos[key] ? 'cumplido' : ''}>
            {requisitos[key] ? '✓' : '○'} {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
