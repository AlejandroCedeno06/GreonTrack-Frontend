const MIN_LONGITUD = 8;

export interface RequisitosPassword {
  longitud: boolean;
  mayuscula: boolean;
  minuscula: boolean;
  numero: boolean;
  especial: boolean;
}

export type NivelFortaleza = 'debil' | 'media' | 'fuerte';

export interface FortalezaPassword {
  requisitos: RequisitosPassword;
  puntaje: number; // 0-5, uno por cada requisito cumplido
  nivel: NivelFortaleza;
  esValida: boolean; // cumple todos los requisitos
}

export function evaluarFortaleza(password: string): FortalezaPassword {
  const requisitos: RequisitosPassword = {
    longitud: password.length >= MIN_LONGITUD,
    mayuscula: /[A-Z]/.test(password),
    minuscula: /[a-z]/.test(password),
    numero: /[0-9]/.test(password),
    especial: /[^A-Za-z0-9]/.test(password),
  };

  const puntaje = Object.values(requisitos).filter(Boolean).length;
  const esValida = puntaje === 5;

  let nivel: NivelFortaleza = 'debil';
  if (puntaje === 5) nivel = 'fuerte';
  else if (puntaje >= 3) nivel = 'media';

  return { requisitos, puntaje, nivel, esValida };
}
