import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { LeafIcon, ChevronDownIcon } from '../components/icons';

interface Paso {
  titulo: string;
  resumen: string;
  subpasos: string[];
  porQue: string;
}

const PASOS: Paso[] = [
  {
    titulo: 'Agrega tus dispositivos',
    resumen: 'Dalos de alta manualmente o deja que el Sniffer los detecte solo en tu red.',
    subpasos: [
      'Manual: ve a Dispositivos → Agregar manualmente y llena nombre, categoría y consumo en watts (revisa la etiqueta o el manual del aparato si no conoces el dato exacto).',
      'Automático: corre el GreonTrack Sniffer en la misma red donde están tus dispositivos, entra a Dispositivos → Detectar en mi red, dale Actualizar, y agrega con un clic las sugerencias que reconozcas.',
      'No hace falta que los dos métodos sean excluyentes: puedes empezar manual y luego completar tu lista con lo que detecte el Sniffer.',
    ],
    porQue:
      'Sin dispositivos dados de alta no hay nada que medir — es el primer paso obligatorio. Entre más completa esté tu lista (incluyendo los "chiquitos" como cargadores o consolas), más realista es tu huella total.',
  },
  {
    titulo: 'Registra tus horas de uso reales',
    resumen: 'Captura cuánto tiempo usaste cada dispositivo — es el dato que más importa.',
    subpasos: [
      'Entra a Registrar uso, elige el dispositivo y mueve el control a las horas reales que lo usaste ese día.',
      'Hazlo con la frecuencia que puedas: diario es lo ideal, pero incluso registrar cada 2-3 días te da una tendencia útil.',
      'Si un dispositivo quedó vinculado como "Agente", su registro puede llegar de forma automática — revisa su tarjeta en Dispositivos para confirmarlo.',
    ],
    porQue:
      'kWh = watts × horas ÷ 1000. Sin horas reales, todo lo demás (costo, CO₂, recomendaciones, huella de carbono) es una suposición. Es el dato individual que más impacta la precisión de todo el sistema.',
  },
  {
    titulo: 'Revisa tus Estadísticas y tu Huella de carbono',
    resumen: 'Ahí se traduce tu registro en consumo, costo y CO₂ — con gráficas y comparativas.',
    subpasos: [
      'En Estadísticas mira tu consumo y costo por dispositivo, y cómo se comporta día a día en los últimos 30 días.',
      'En Huella de carbono revisa cuánto CO₂ generaste, cómo te comparas contra el promedio de un hogar en México, y a cuántos árboles o kilómetros en auto equivale.',
      'Presta atención al aviso de si tu huella subió o bajó respecto a la semana anterior.',
    ],
    porQue:
      'Ver los datos ordenados te ayuda a identificar patrones — qué dispositivo pesa más, si tu consumo sube entre semana — antes de decidir qué cambiar primero.',
  },
  {
    titulo: 'Sigue tus Recomendaciones',
    resumen: 'Sugerencias con ahorro estimado en kWh, costo y CO₂, no solo consejos genéricos.',
    subpasos: [
      'Entra a Recomendaciones e identifica las que traen la etiqueta "Ahorro estimado" — son las de mayor impacto, ligadas a un dispositivo específico.',
      'Aplica el cambio sugerido (reducir horas de uso, desconectar en standby, repartir mejor tus horarios).',
      'Vuelve a registrar tu uso los días siguientes para ver el efecto real reflejado en tus Estadísticas.',
    ],
    porQue:
      'Convierte datos en acciones concretas y medibles, en vez de quedarse en consejos genéricos que no sabes si de verdad ayudan.',
  },
  {
    titulo: 'Hazle caso a la campanita',
    resumen: 'Te avisa cambios importantes sin que tengas que revisar cada sección manualmente.',
    subpasos: [
      'Ábrela cada que entres a la app — el puntito rojo te indica que hay algo nuevo.',
      'Cada alerta te lleva directo a la página relevante con un clic.',
      'Si no hay nada urgente, te lo dice también ("Todo tranquilo por ahora") para que no te quede la duda.',
    ],
    porQue:
      'Las alertas se calculan en vivo con tus propios datos (consumo que sube/baja, nivel alto, recomendaciones nuevas) — es la forma más rápida de saber si algo necesita tu atención.',
  },
  {
    titulo: 'Descarga tu reporte cuando lo necesites',
    resumen: 'Un PDF completo con tu análisis, gráficas y recomendaciones.',
    subpasos: [
      'Ve a Reportes y dale a Generar reporte PDF.',
      'Úsalo como respaldo mensual, o para presentar tus resultados (a ti mismo, a tu familia, o para la escuela).',
    ],
    porQue: 'Te da un documento completo en un solo lugar, sin tener que armarlo a mano cada vez.',
  },
];

interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

const FAQ: PreguntaFrecuente[] = [
  {
    pregunta: '¿Qué pasa si no tengo el GreonTrack Sniffer corriendo?',
    respuesta:
      'Nada se rompe: simplemente no vas a ver sugerencias en Dispositivos → Detectar en mi red. Puedes seguir usando GreonTrack dando de alta tus dispositivos de forma manual sin ningún problema.',
  },
  {
    pregunta: '¿Puedo editar el consumo en watts de un dispositivo después de agregarlo?',
    respuesta:
      'Sí, desde Dispositivos puedes editar cualquier dato en cualquier momento. Si corriges el consumo en watts, los cálculos de kWh, costo y CO₂ se ajustan automáticamente hacia adelante.',
  },
  {
    pregunta: '¿La tarifa eléctrica y el factor de CO₂ los puedo cambiar yo?',
    respuesta:
      'No — son valores globales de configuración que usa todo el sistema para mantener consistencia entre usuarios. Puedes consultarlos en Configuración, pero no editarlos desde tu cuenta.',
  },
  {
    pregunta: '¿Qué diferencia hay entre un dispositivo "Manual" y uno "Agente"?',
    respuesta:
      '"Manual" significa que tú registras sus horas de uso a mano en Registrar uso. "Agente" significa que quedó vinculado para reportar su uso de forma más automática — revisa "Ver código" en su tarjeta para vincularlo.',
  },
];

function AccordionItem({
  numero,
  titulo,
  resumen,
  abierto,
  onToggle,
  children,
}: {
  numero?: number;
  titulo: string;
  resumen?: string;
  abierto: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <li className="guide-step">
      <button type="button" className="guide-step-header" onClick={onToggle} aria-expanded={abierto}>
        {numero != null && <span className="modal-instruction-number">{numero}</span>}
        <div className="guide-step-header-text">
          <strong>{titulo}</strong>
          {resumen && <p>{resumen}</p>}
        </div>
        <ChevronDownIcon className={`guide-step-chevron${abierto ? ' open' : ''}`} />
      </button>
      {abierto && <div className="guide-step-body">{children}</div>}
    </li>
  );
}

export function Guide() {
  const [pasoAbierto, setPasoAbierto] = useState<number | null>(0);
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);

  return (
    <AppShell
      title="Guía de uso"
      subtitle="Cómo sacarle el máximo provecho a GreonTrack, y por qué cada dato que registras importa."
    >
      <div className="guide-hero">
        <span className="guide-hero-icon">
          <LeafIcon />
        </span>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Tu consumo, bajo control</h2>
          <p style={{ margin: 0 }}>
            GreonTrack convierte tus dispositivos y tus horas de uso reales en consumo, costo y huella de
            carbono — para que tomes decisiones con datos, no con suposiciones. Esta guía te lleva paso a
            paso desde cero hasta sacarle provecho todos los días.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 32, marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Primeros pasos</h2>
        <p className="muted" style={{ marginTop: -6, marginBottom: 18 }}>
          Dale clic a cada paso para ver el detalle completo.
        </p>
        <ul className="guide-step-list">
          {PASOS.map((paso, i) => (
            <AccordionItem
              key={paso.titulo}
              numero={i + 1}
              titulo={paso.titulo}
              resumen={paso.resumen}
              abierto={pasoAbierto === i}
              onToggle={() => setPasoAbierto((cur) => (cur === i ? null : i))}
            >
              <ul className="guide-substeps">
                {paso.subpasos.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <p className="guide-porque">
                <strong>¿Por qué hacerlo? </strong>
                {paso.porQue}
              </p>
            </AccordionItem>
          ))}
        </ul>
      </div>

      <div className="card" style={{ padding: 32, marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>¿Por qué importa medir de verdad?</h2>
        <p className="muted">
          GreonTrack no adivina tu consumo: lo calcula a partir de lo que tú registras. Cada hora de uso que
          capturas se traduce directo en kWh, costo y kg de CO₂ — no son números inventados, son tu consumo
          real.
        </p>
        <p className="muted">
          No necesitas cambios drásticos de un día para otro. Apagar dispositivos en modo de espera, reducir
          una hora de uso en tu aparato de mayor consumo, o simplemente ser constante registrando tu uso —
          todo eso, sostenido en el tiempo, sí se nota: en tu recibo de luz y en tu huella de carbono.
        </p>
      </div>

      <div className="card" style={{ padding: 32, marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Preguntas frecuentes</h2>
        <ul className="guide-step-list">
          {FAQ.map((item, i) => (
            <AccordionItem
              key={item.pregunta}
              titulo={item.pregunta}
              abierto={faqAbierta === i}
              onToggle={() => setFaqAbierta((cur) => (cur === i ? null : i))}
            >
              <p className="guide-porque">{item.respuesta}</p>
            </AccordionItem>
          ))}
        </ul>
      </div>

      <div className="guide-cta">
        <div>
          <strong>¿Listo para empezar?</strong>
          <p>
            Cada kWh que ahorras hoy es CO₂ que no se emite mañana. La constancia en registrar tu uso real
            es lo que hace que todo el sistema — estadísticas, recomendaciones y huella de carbono —
            funcione a tu favor.
          </p>
        </div>
        <Link className="btn-add" to="/dispositivos">
          Ir a Dispositivos
        </Link>
      </div>
    </AppShell>
  );
}
