/**
 * Generador de Contraseñas Seguras
 * Vanilla JavaScript — sin dependencias externas
 * Metodología BEM, sin innerHTML, sin alert/confirm/prompt
 *
 * @file app.js
 */

'use strict';

/* =========================================
   CONSTANTES DE CARACTERES
   ========================================= */

/** @type {string} Letras mayúsculas del alfabeto inglés */
const CHARS_UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** @type {string} Letras minúsculas del alfabeto inglés */
const CHARS_LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';

/** @type {string} Dígitos del 0 al 9 */
const CHARS_NUMBERS = '0123456789';

/** @type {string} Caracteres especiales y símbolos */
const CHARS_SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/* =========================================
   REFERENCIAS AL DOM
   ========================================= */

/** @type {HTMLFormElement} Formulario de configuración */
const formEl = /** @type {HTMLFormElement} */ (document.getElementById('config-form'));

/** @type {HTMLInputElement} Slider de longitud de contraseña */
const inputLength = /** @type {HTMLInputElement} */ (document.getElementById('input-length'));

/** @type {HTMLElement} Elemento que muestra el valor numérico de la longitud */
const lengthValueEl = /** @type {HTMLElement} */ (document.getElementById('length-value'));

/** @type {HTMLInputElement} Checkbox: incluir mayúsculas */
const checkUppercase = /** @type {HTMLInputElement} */ (document.getElementById('check-uppercase'));

/** @type {HTMLInputElement} Checkbox: incluir minúsculas */
const checkLowercase = /** @type {HTMLInputElement} */ (document.getElementById('check-lowercase'));

/** @type {HTMLInputElement} Checkbox: incluir números */
const checkNumbers = /** @type {HTMLInputElement} */ (document.getElementById('check-numbers'));

/** @type {HTMLInputElement} Checkbox: incluir símbolos */
const checkSymbols = /** @type {HTMLInputElement} */ (document.getElementById('check-symbols'));

/** @type {HTMLInputElement} Input que muestra la contraseña generada */
const passwordDisplayEl = /** @type {HTMLInputElement} */ (document.getElementById('password-display'));

/** @type {HTMLButtonElement} Botón para mostrar/ocultar la contraseña */
const btnToggleVisibility = /** @type {HTMLButtonElement} */ (document.getElementById('btn-toggle-visibility'));

/** @type {SVGElement} Icono de ojo abierto */
const iconEyeOpen = /** @type {SVGElement} */ (document.getElementById('icon-eye-open'));

/** @type {SVGElement} Icono de ojo cerrado */
const iconEyeClosed = /** @type {SVGElement} */ (document.getElementById('icon-eye-closed'));

/** @type {HTMLButtonElement} Botón de copiar al portapapeles */
const btnCopy = /** @type {HTMLButtonElement} */ (document.getElementById('btn-copy'));

/** @type {HTMLElement} Texto del botón copiar */
const copyBtnTextEl = /** @type {HTMLElement} */ (document.getElementById('copy-btn-text'));

/** @type {HTMLElement} Contenedor de las barras de fortaleza */
const strengthBarsEl = /** @type {HTMLElement} */ (document.getElementById('strength-bars'));

/** @type {HTMLElement} Barra de fortaleza 1 */
const strengthBar1 = /** @type {HTMLElement} */ (document.getElementById('strength-bar-1'));

/** @type {HTMLElement} Barra de fortaleza 2 */
const strengthBar2 = /** @type {HTMLElement} */ (document.getElementById('strength-bar-2'));

/** @type {HTMLElement} Barra de fortaleza 3 */
const strengthBar3 = /** @type {HTMLElement} */ (document.getElementById('strength-bar-3'));

/** @type {HTMLElement} Barra de fortaleza 4 */
const strengthBar4 = /** @type {HTMLElement} */ (document.getElementById('strength-bar-4'));

/** @type {HTMLElement} Etiqueta de texto de la fortaleza */
const strengthLabelEl = /** @type {HTMLElement} */ (document.getElementById('strength-label'));

/** @type {HTMLElement} Párrafo de mensajes de error de validación */
const configErrorEl = /** @type {HTMLElement} */ (document.getElementById('config-error'));

/** @type {HTMLElement} Span del año en el footer */
const footerYearEl = /** @type {HTMLElement} */ (document.getElementById('footer-year'));

/* =========================================
   TIPOS Y ESTADO DE LA APLICACIÓN
   ========================================= */

/**
 * @typedef {Object} AppState
 * @property {string}       password  - Contraseña generada actualmente
 * @property {boolean}      isHidden  - Si la contraseña está oculta (tipo password)
 * @property {number|null}  copyTimer - ID del timer para resetear el botón de copiar
 */

/**
 * @typedef {Object} StrengthConfig
 * @property {'weak'|'fair'|'good'|'strong'} level - Nivel de fortaleza
 * @property {string}                        label - Texto para mostrar al usuario
 * @property {number}                        bars  - Número de barras a activar (1-4)
 */

/** @type {AppState} Estado global de la aplicación */
const state = {
  password:  '',
  isHidden:  false,
  copyTimer: null,
};

/* =========================================
   CONFIGURACIÓN DE FORTALEZA
   ========================================= */

/**
 * Configuración de cada nivel de fortaleza.
 * Índice 0 es null (sin contraseña), índices 1-4 son los niveles.
 * @type {Array<StrengthConfig|null>}
 */
const STRENGTH_CONFIG = [
  null,
  { level: 'weak',   label: 'Débil',   bars: 1 },
  { level: 'fair',   label: 'Regular', bars: 2 },
  { level: 'good',   label: 'Buena',   bars: 3 },
  { level: 'strong', label: 'Fuerte',  bars: 4 },
];

/** @type {HTMLElement[]} Lista ordenada de las 4 barras de fortaleza */
const allBars = [strengthBar1, strengthBar2, strengthBar3, strengthBar4];

/** @type {Array<'weak'|'fair'|'good'|'strong'>} Modificadores BEM de fortaleza */
const allStrengthModifiers = ['weak', 'fair', 'good', 'strong'];

/* =========================================
   INICIALIZACIÓN
   ========================================= */

/**
 * Inicializa la aplicación: año en footer, longitud inicial,
 * sincronización del tipo del input y track del slider.
 * @returns {void}
 */
function init() {
  // Año en el footer
  footerYearEl.textContent = String(new Date().getFullYear());

  // Mostrar longitud inicial
  updateLengthDisplay(inputLength.value);

  // Sincronizar el type del input con el estado inicial (visible)
  passwordDisplayEl.type = state.isHidden ? 'password' : 'text';
  updateVisibilityIcon(state.isHidden);

  // Actualizar track de rango con valor inicial
  updateRangeTrack(inputLength, inputLength.value);
}

/* =========================================
   ACTUALIZAR DISPLAY DE LONGITUD
   ========================================= */

/**
 * Actualiza el texto que muestra el valor actual del slider de longitud
 * y aplica un micro-efecto de escala.
 * @param {string} value - Valor actual del slider como string
 * @returns {void}
 */
function updateLengthDisplay(value) {
  lengthValueEl.textContent = value;
  inputLength.setAttribute('aria-valuenow', value);
  // Pequeño efecto de escala al cambiar
  lengthValueEl.style.transform = 'scale(1.15)';
  setTimeout(function () {
    lengthValueEl.style.transform = 'scale(1)';
  }, 150);
}

/* =========================================
   ACTUALIZAR VISUAL DEL RANGO (track relleno)
   ========================================= */

/**
 * Establece el degradado de relleno del slider según su valor actual.
 * @param {HTMLInputElement} rangeEl - El elemento input type="range"
 * @param {string|number}   value   - Valor actual del slider
 * @returns {void}
 */
function updateRangeTrack(rangeEl, value) {
  const min = Number(rangeEl.min) || 4;
  const max = Number(rangeEl.max) || 64;
  const pct = ((Number(value) - min) / (max - min)) * 100;
  rangeEl.style.background =
    'linear-gradient(to right, #3b82f6 0%, #38bdf8 ' + pct + '%, #101c3a ' + pct + '%, #101c3a 100%)';
}

/* =========================================
   GENERAR CONTRASEÑA
   ========================================= */

/**
 * Construye el pool de caracteres disponibles según las opciones activas.
 * @returns {string} Cadena con todos los caracteres posibles
 */
function buildCharacterPool() {
  let pool = '';
  if (checkUppercase.checked) { pool += CHARS_UPPERCASE; }
  if (checkLowercase.checked) { pool += CHARS_LOWERCASE; }
  if (checkNumbers.checked)   { pool += CHARS_NUMBERS; }
  if (checkSymbols.checked)   { pool += CHARS_SYMBOLS; }
  return pool;
}

/**
 * Genera una contraseña aleatoria criptográficamente segura.
 * Usa `crypto.getRandomValues` para garantizar aleatoriedad real.
 * @param {number} length - Longitud deseada de la contraseña
 * @param {string} pool   - Conjunto de caracteres disponibles
 * @returns {string} Contraseña generada
 */
function generatePassword(length, pool) {
  let result = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += pool[array[i] % pool.length];
  }
  return result;
}

/* =========================================
   CALCULAR FORTALEZA
   ========================================= */

/**
 * Calcula la fortaleza de una contraseña en una escala de 0 a 4.
 * - 0: sin contraseña
 * - 1: débil
 * - 2: regular
 * - 3: buena
 * - 4: fuerte
 * @param {string} password - Contraseña a evaluar
 * @returns {0|1|2|3|4} Nivel de fortaleza
 */
function calculateStrength(password) {
  if (!password) { return 0; }

  let score = 0;
  const len = password.length;

  // Longitud
  if (len >= 8)  { score += 1; }
  if (len >= 14) { score += 1; }
  if (len >= 20) { score += 1; }

  // Variedad de caracteres
  if (/[A-Z]/.test(password))        { score += 1; }
  if (/[a-z]/.test(password))        { score += 1; }
  if (/[0-9]/.test(password))        { score += 1; }
  if (/[^A-Za-z0-9]/.test(password)) { score += 2; }

  // Normalizar a 4 niveles
  if (score <= 2) { return 1; }
  if (score <= 4) { return 2; }
  if (score <= 6) { return 3; }
  return 4;
}

/* =========================================
   ACTUALIZAR UI DE FORTALEZA
   ========================================= */

/**
 * Actualiza el indicador visual de fortaleza: activa las barras
 * y cambia el texto y color de la etiqueta.
 * @param {0|1|2|3|4} score - Nivel de fortaleza calculado
 * @returns {void}
 */
function updateStrengthUI(score) {
  // Limpiar clases anteriores en barras
  allBars.forEach(function (bar) {
    allStrengthModifiers.forEach(function (mod) {
      bar.classList.remove('strength__bar--' + mod);
    });
    bar.classList.remove('strength__bar--active');
  });

  // Limpiar clases anteriores en label
  allStrengthModifiers.forEach(function (mod) {
    strengthLabelEl.classList.remove('strength__label--' + mod);
  });

  strengthBarsEl.setAttribute('aria-valuenow', String(score));

  if (score === 0) {
    strengthLabelEl.textContent = 'Sin contraseña';
    return;
  }

  const config = STRENGTH_CONFIG[score];
  if (!config) { return; }

  // Activar barras correspondientes
  for (let i = 0; i < config.bars; i++) {
    allBars[i].classList.add('strength__bar--active');
    allBars[i].classList.add('strength__bar--' + config.level);
  }

  // Actualizar label
  strengthLabelEl.textContent = config.label;
  strengthLabelEl.classList.add('strength__label--' + config.level);
}

/* =========================================
   MOSTRAR / OCULTAR CONTRASEÑA
   ========================================= */

/**
 * Actualiza los iconos del ojo y el aria-label del botón
 * de visibilidad según el estado oculto/visible.
 * @param {boolean} isHidden - true si la contraseña está oculta
 * @returns {void}
 */
function updateVisibilityIcon(isHidden) {
  if (isHidden) {
    iconEyeOpen.style.display   = 'none';
    iconEyeClosed.style.display = 'block';
    btnToggleVisibility.setAttribute('aria-label', 'Mostrar contraseña');
  } else {
    iconEyeOpen.style.display   = 'block';
    iconEyeClosed.style.display = 'none';
    btnToggleVisibility.setAttribute('aria-label', 'Ocultar contraseña');
  }
}

/**
 * Aplica el tipo actual del input (text/password) según `state.isHidden`.
 * No hace nada si no hay contraseña generada todavía.
 * @returns {void}
 */
function renderPasswordText() {
  if (!state.password) { return; }
  // Con input nativo: cambiar el type es suficiente para mostrar/ocultar
  passwordDisplayEl.type = state.isHidden ? 'password' : 'text';
}

/* =========================================
   MOSTRAR CONTRASEÑA EN LA UI
   ========================================= */

/**
 * Muestra la contraseña generada en el campo de texto,
 * actualiza el estado y habilita el botón de copiar.
 * @param {string} password - Contraseña generada a mostrar
 * @returns {void}
 */
function renderPassword(password) {
  state.password = password;

  // El valor se asigna con .value en un input
  passwordDisplayEl.value = password;
  // Aplicar visibilidad actual
  passwordDisplayEl.type = state.isHidden ? 'password' : 'text';

  btnCopy.disabled = false;
}

/* =========================================
   MOSTRAR / OCULTAR ERROR
   ========================================= */

/**
 * Muestra un mensaje de error de validación con animación de vibración.
 * @param {string} message - Texto del mensaje de error
 * @returns {void}
 */
function showError(message) {
  configErrorEl.textContent = message;
  configErrorEl.classList.add('config__error--visible');

  // Efecto vibración en el formulario
  formEl.classList.add('shake');
  formEl.addEventListener('animationend', function onAnimEnd() {
    formEl.classList.remove('shake');
    formEl.removeEventListener('animationend', onAnimEnd);
  });
}

/**
 * Oculta el mensaje de error de validación.
 * @returns {void}
 */
function hideError() {
  configErrorEl.textContent = '';
  configErrorEl.classList.remove('config__error--visible');
}

/* =========================================
   COPIAR AL PORTAPAPELES
   ========================================= */

/**
 * Copia la contraseña actual al portapapeles.
 * Usa la Clipboard API si está disponible (HTTPS/localhost),
 * y cae al fallback con execCommand en caso contrario (file://).
 * @returns {void}
 */
function copyToClipboard() {
  if (!state.password) { return; }

  // La Clipboard API solo está disponible en contextos seguros (HTTPS / localhost).
  // Si no está disponible, usamos el fallback con execCommand.
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(state.password).then(function () {
      showCopiedFeedback();
    }).catch(function () {
      showFallbackCopy();
    });
  } else {
    showFallbackCopy();
  }
}

/**
 * Muestra el feedback visual de "copiado" en el botón y lo resetea
 * automáticamente tras 2 segundos.
 * @returns {void}
 */
function showCopiedFeedback() {
  btnCopy.classList.add('password-output__copy--copied');
  copyBtnTextEl.textContent = '¡Copiado!';

  clearTimeout(/** @type {number} */ (state.copyTimer));
  state.copyTimer = setTimeout(function () {
    btnCopy.classList.remove('password-output__copy--copied');
    copyBtnTextEl.textContent = 'Copiar';
  }, 2000);
}

/**
 * Fallback de copia para contextos sin Clipboard API (ej: file://).
 * Cambia temporalmente el input a type="text", lo selecciona,
 * ejecuta el comando de copia y restaura el tipo original.
 * @returns {void}
 */
function showFallbackCopy() {
  // El elemento ya es un input: podemos seleccionar su valor directamente
  const previousType = passwordDisplayEl.type;
  passwordDisplayEl.type = 'text'; // necesario para poder seleccionar en inputs type=password
  passwordDisplayEl.select();

  try {
    const success = document.execCommand('copy');
    if (success) {
      showCopiedFeedback();
    } else {
      showError('No se pudo copiar. Por favor copia manualmente.');
    }
  } catch (err) {
    showError('No se pudo copiar. Por favor copia manualmente.');
  } finally {
    passwordDisplayEl.type = previousType; // restaurar tipo original
    passwordDisplayEl.blur();
  }
}

/* =========================================
   EVENT LISTENERS
   ========================================= */

// Slider de longitud
inputLength.addEventListener('input', function (event) {
  const target = /** @type {HTMLInputElement} */ (event.target);
  updateLengthDisplay(target.value);
  updateRangeTrack(target, target.value);
});

// Formulario — generar contraseña
formEl.addEventListener('submit', function (event) {
  event.preventDefault();
  hideError();

  const pool = buildCharacterPool();

  if (!pool) {
    showError('Selecciona al menos un tipo de carácter para generar la contraseña.');
    return;
  }

  const length   = parseInt(inputLength.value, 10);
  const password = generatePassword(length, pool);
  const score    = /** @type {0|1|2|3|4} */ (calculateStrength(password));

  renderPassword(password);
  updateStrengthUI(score);
});

// Botón toggle visibilidad
btnToggleVisibility.addEventListener('click', function () {
  state.isHidden = !state.isHidden;
  updateVisibilityIcon(state.isHidden);
  renderPasswordText();
});

// Botón copiar
btnCopy.addEventListener('click', function (event) {
  event.preventDefault();
  copyToClipboard();
});

/* =========================================
   ARRANQUE
   ========================================= */
init();
