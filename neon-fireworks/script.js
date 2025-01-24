// Importar el cursor de neón desde Three.js Toys
import { neonCursor } from 'https://unpkg.com/threejs-toys@0.0.8/build/threejs-toys.module.cdn.min.js';

// Inicializar el cursor de neón
neonCursor({
  el: document.getElementById('app'),
  shaderPoints: 16,
  curvePoints: 80,
  curveLerp: 0.5,
  radius1: 5,
  radius2: 30,
  velocityTreshold: 10,
  sleepRadiusX: 100,
  sleepRadiusY: 100,
  sleepTimeCoefX: 0.0025,
  sleepTimeCoefY: 0.0025
});

// Funcionalidad de los fuegos artificiales de letras

// Definir colores vibrantes
const colors = [
  "#ff6f91",
  "#ff9671",
  "#ffc75f",
  "#f9f871",
  "#ff4c4c",
  "#ffcc00"
];

// Mensaje a mostrar
const letters = "¡FELIZ AÑO!"; // Puedes personalizar el mensaje
let letterIndex = 0; // Índice para recorrer las letras

// Obtener la siguiente letra del mensaje
function getRandomLetter() {
  const letter = letters.charAt(letterIndex); // Obtener la letra actual
  letterIndex = (letterIndex + 1) % letters.length; // Avanzar al siguiente, reiniciar al final
  return letter;
}

// Crear un fuego artificial en la ubicación del clic
function createFirework(x, y) {
  const launchHeight = Math.random() * (window.innerHeight / 4) + window.innerHeight / 4;
  const projectile = document.createElement("div");
  projectile.classList.add("projectile");
  document.body.appendChild(projectile);
  projectile.style.left = `${x}px`;
  projectile.style.top = `${y}px`;

  anime({
    targets: projectile,
    translateY: -launchHeight,
    duration: 1200,
    easing: "easeOutQuad",
    complete: () => {
      projectile.remove();
      createBurst(x, y - launchHeight);
    }
  });
}

// Crear una explosión de partículas
function createBurst(x, y) {
  const numLetters = 15; // Número de letras en la explosión
  const numSparkles = 50; // Número de destellos adicionales

  // Crear letras
  for (let i = 0; i < numLetters; i++) {
    createParticle(x, y, false);
  }

  // Crear destellos
  for (let i = 0; i < numSparkles; i++) {
    createParticle(x, y, true);
  }
}

// Crear una única partícula (letra o destello)
function createParticle(x, y, isSparkle) {
  const el = document.createElement("div");
  el.classList.add(isSparkle ? "sparkle" : "particule");
  
  // Ocultar las instrucciones al hacer el primer clic
  if (document.querySelector('.instructions').style.display !== 'none') {
    document.querySelector('.instructions').style.display = 'none';
  }

  if (!isSparkle) {
    el.textContent = getRandomLetter();
    el.style.color = colors[Math.floor(Math.random() * colors.length)];
  } else {
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
  }

  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);

  animateParticle(el, isSparkle);
}

// Animar una partícula
function animateParticle(el, isSparkle) {
  const angle = Math.random() * Math.PI * 2; // Dirección aleatoria
  const distance = anime.random(100, 200); // Distancia aleatoria para dispersión
  const duration = anime.random(1200, 2000); // Duración aleatoria
  const fallDistance = anime.random(20, 80); // Distancia de caída para efecto de gravedad
  const scale = isSparkle ? Math.random() * 0.5 + 0.5 : Math.random() * 1 + 0.5;

  anime.timeline({
    targets: el,
    easing: "easeOutCubic",
    duration: duration,
    complete: () => el.remove() // Remover el elemento tras la animación
  })
  .add({
    translateX: Math.cos(angle) * distance,
    translateY: Math.sin(angle) * distance,
    scale: [0, scale],
    opacity: [1, 0.9]
  })
  .add({
    translateY: `+=${fallDistance}px`, // Efecto de caída
    opacity: [0.9, 0],
    easing: "easeInCubic",
    duration: duration / 2
  });
}

// Añadir listener para el evento de clic
document.addEventListener("click", (e) => {
  createFirework(e.clientX, e.clientY);
});

// Disparar un fuego artificial al cargar la página
window.onload = function () {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  createFirework(centerX, centerY);
};
