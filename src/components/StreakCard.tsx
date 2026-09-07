import { Link } from 'react-router-dom';
import { FireIcon } from './icons';
import { HITOS_RACHA, hitoAlcanzado, siguienteHito } from '../lib/streak';

interface StreakCardProps {
  dias: number;
  activaHoy: boolean;
}

export function StreakCard({ dias, activaHoy }: StreakCardProps) {
  const sinRacha = dias === 0 && !activaHoy;
  const hito = hitoAlcanzado(dias);
  const siguiente = siguienteHito(dias);

  return (
    <div className="streak-card">
      <div className="streak-card-top">
        <span className="streak-card-icon">
          <FireIcon />
        </span>
        <div className="streak-card-text">
          {sinRacha ? (
            <>
              <strong>Empieza tu racha hoy</strong>
              <p>Registra el uso de al menos un dispositivo para arrancar tu racha de constancia.</p>
            </>
          ) : (
            <>
              <strong>
                Racha de {dias} día{dias === 1 ? '' : 's'}
                {hito && (
                  <span className="streak-badge">
                    {hito.emoji} {hito.titulo}
                  </span>
                )}
              </strong>
              <p>
                {activaHoy
                  ? 'Ya registraste tu uso hoy — sigue así.'
                  : 'Todavía no registras tu uso de hoy. Hazlo para mantener tu racha viva.'}
                {siguiente &&
                  ` Te faltan ${siguiente.dias - dias} días para "${siguiente.titulo}" (${siguiente.dias} días).`}
              </p>
            </>
          )}
        </div>
        {!activaHoy && (
          <Link className="btn-add btn-add-outline" to="/registrar-uso">
            Registrar uso
          </Link>
        )}
      </div>

      <div className="streak-milestones">
        {HITOS_RACHA.map((h, i) => {
          const alcanzado = dias >= h.dias;
          const esActual = hito?.dias === h.dias;
          return (
            <div
              key={h.dias}
              className={`streak-milestone${alcanzado ? ' reached' : ''}${esActual ? ' current' : ''}`}
            >
              {i > 0 && <span className={`streak-milestone-line${alcanzado ? ' reached' : ''}`} />}
              <span className="streak-milestone-dot" title={`${h.titulo} (${h.dias} días)`}>
                {h.emoji}
              </span>
              <span className="streak-milestone-label">{h.dias}d</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
