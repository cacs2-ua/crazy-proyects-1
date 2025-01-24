// Importamos la función neonCursor desde la CDN de threejs-toys
import { neonCursor } from 'https://unpkg.com/threejs-toys@0.0.8/build/threejs-toys.module.cdn.min.js';

/* 1) --- CONFIGURACIÓN Y ACTIVACIÓN DEL CURSOR NEÓN --- */
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

/* 2) --- LÓGICA DE FUEGOS ARTIFICIALES --- */

// Colores vibrantes para las partículas (ajustados para un efecto neón más intenso)
const colors = [
  "#ff6f91",
  "#ff9671",
  "#ffc75f",
  "#f9f871",
  "#ff4c4c",
  "#ffcc00",
  "#00f5d4",
  "#8e2de2",
  "#4a00e0"
];

// Mensaje que se va a mostrar con las letras
const letters = "0123456789"; 
let letterIndex = 0; // Índice para recorrer las letras

// Retorna la siguiente letra del mensaje "I LOVE YOU"
function getRandomLetter() {
  const letter = letters.charAt(letterIndex);
  letterIndex = (letterIndex + 1) % letters.length;
  return letter;
}

// Crea un fuego artificial en la posición (x, y) del click
function createFirework(x, y) {
  // Altura de lanzamiento al azar
  const launchHeight = Math.random() * (window.innerHeight / 4) + window.innerHeight / 4;
  
  // Creación del proyectil que sube antes de explotar
  const projectile = document.createElement("div");
  projectile.classList.add("projectile");
  document.body.appendChild(projectile);

  // Posicionamos el proyectil en el lugar del click
  projectile.style.left = `${x}px`;
  projectile.style.top = `${y}px`;

  // Animación de subida
  anime({
    targets: projectile,
    translateY: -launchHeight,
    duration: 1200,
    easing: "easeOutQuad",
    complete: () => {
      // Una vez que la animación termina, removemos el proyectil y creamos la explosión
      projectile.remove();
      createBurst(x, y - launchHeight);
    }
  });
}

// Crea la explosión que contiene letras y chispas
function createBurst(x, y) {
  const numLetters = 15;   // Número de letras en la explosión
  const numSparkles = 50;  // Número de chispas en la explosión

  // Crear letras
  for (let i = 0; i < numLetters; i++) {
    createParticle(x, y, false);
  }

  // Crear chispas
  for (let i = 0; i < numSparkles; i++) {
    createParticle(x, y, true);
  }
}

// Crea una partícula individual (puede ser letra o chispa)
function createParticle(x, y, isSparkle) {
  const el = document.createElement("div");
  el.classList.add(isSparkle ? "sparkle" : "particule");
  
  // Al primer click, ocultamos las instrucciones
  document.querySelector('.instructions').style.display = 'none';

  // Si no es chispa, es una letra
  if (!isSparkle) {
    el.textContent = getRandomLetter();
    el.style.color = colors[Math.floor(Math.random() * colors.length)];
  } else {
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
  }

  // Posicionamos la partícula en el lugar de la explosión
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);

  // Lanzamos la animación de la partícula
  animateParticle(el, isSparkle);
}

// Anima la partícula para que "explote" y desaparezca
function animateParticle(el, isSparkle) {
  const angle = Math.random() * Math.PI * 2;    // Dirección aleatoria
  const distance = anime.random(100, 200);      // Distancia a la que se expande
  const duration = anime.random(1200, 2000);    // Tiempo de duración de la animación
  const fallDistance = anime.random(20, 80);    // Caída extra para simular gravedad
  const scale = isSparkle
    ? Math.random() * 0.5 + 0.5
    : Math.random() * 1 + 0.5;

  anime.timeline({
    targets: el,
    easing: "easeOutCubic",
    duration: duration,
    complete: () => el.remove() // Al finalizar la animación, se elimina la partícula
  })
  .add({
    translateX: Math.cos(angle) * distance,
    translateY: Math.sin(angle) * distance,
    scale: [0, scale],
    opacity: [1, 0.9]
  })
  .add({
    translateY: `+=${fallDistance}px`, // Movemos un poco más abajo para simular gravedad
    opacity: [0.9, 0],
    easing: "easeInCubic",
    duration: duration / 2
  });
}

// Listener para crear los fuegos artificiales cada vez que se hace click
document.addEventListener("click", (e) => {
  createFirework(e.clientX, e.clientY);
});

// Dispara automáticamente un fuego artificial al cargar la página, en el centro
window.onload = function () {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  createFirework(centerX, centerY);
};
