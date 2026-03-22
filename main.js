import Vector from './vec.js';

const ctx = canvas.getContext('2d');
let w = 0;
let h = 0;
let currentAnimationFrame = null;
let isWindowFocus = document.hasFocus();
let isLoading = false;

const bgColor = '#000000';
const guiTextColor = '#ffffff';
let mapBG = '#000000';
let mw = 0;
let mh = 0;

function loadMap(map) {
  return new Promise((resolve, reject) => {
    fetch(`levels/${map}.json`)
      .then(response => {
        if (!response.ok)
          throw new Error('Failed to load map');

        return response.json();
      })
      .then(data => resolve(data))
      .catch(error => {
        console.error('Map loading Error:', error);
        reject(error);
      });
  });
}

function freezeAsync(timeout = 0) {
  return new Promise(res => setTimeout(res, timeout));
}

function drawLoading() {
  ctx.fillStyle = guiTextColor;
  ctx.font = `${Math.floor(Math.min(w, h) * 0.05)}px monospace`;
  ctx.textBaseline = 'middle';

  const dotCount = Math.floor(Math.floor(performance.now()) / 1000 % 3) + 1;
  const loadingText = `Loading${'.'.repeat(dotCount)}${' '.repeat(3 - dotCount)}`;
  const metrics = ctx.measureText(loadingText);
  const width = metrics.width;
  const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const x = (w - width) * 0.5;
  const y = (h - height) * 0.5;

  ctx.fillText(loadingText, x, y);
}

function drawMap() {
  ctx.fillStyle = mapBG;
  ctx.fillRect(0, 0, mw, mh);
}

function draw() {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  isLoading ? drawLoading() : drawMap();
}

function update() {
}

function animate() {
  if (currentAnimationFrame == null) return;
  if (isWindowFocus) update();

  draw();
  currentAnimationFrame = requestAnimationFrame(animate);
}

function play() {
  if (currentAnimationFrame != null) return;
  currentAnimationFrame = requestAnimationFrame(animate);
}

function pause() {
  if (currentAnimationFrame == null) return;

  cancelAnimationFrame(currentAnimationFrame);
  currentAnimationFrame = null;
}

function onResize() {
  const pxRatio = window.devicePixelRatio;

  w = canvas.width = window.innerWidth * pxRatio;
  h = canvas.height = window.innerHeight * pxRatio;
}

function onKeydown(event) {
  switch (event.code) {
    case 'Space':
      currentAnimationFrame == null ? play() : pause();
      break;
  }
}

function onKeyup(event) {
  switch (event.code) {}
}

function onWindowBlur() {
  isWindowFocus = false;
}

function onWindowFocus() {
  isWindowFocus = true;
}

function initLevelVariables(mapData) {
  mapBG = mapData.mainBgColor;
  mw = mapData.width;
  mh = mapData.height;
}

async function loadLevel() {
  isLoading = true;

  try {
    const mapData = await loadMap('lvl0001');

    console.log(mapData);
    initLevelVariables(mapData);
  } catch (error) {}

  // await freezeAsync(3000);
  isLoading = false;
}

window.addEventListener('resize', onResize);
window.addEventListener('keydown', onKeydown);
window.addEventListener('keyup', onKeyup);
window.addEventListener('blur', onWindowBlur);
window.addEventListener('focus', onWindowFocus);

onResize();
play();
loadLevel();
