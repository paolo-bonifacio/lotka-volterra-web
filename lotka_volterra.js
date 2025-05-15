/* sim.js */
let alpha = 1.1, beta = 0.4, delta = 0.1, gamma = 0.4;
let tmax = 50, dt = 0.05;
let preyCurve = [], predCurve = [], tValues = [];
let preyColor, predColor;
let sliderPrey, sliderPred, pauseBtn;
let paused = false;
let animIndex = 0;

function setup() {
  const canvasWidth = windowWidth - 220;
  const canvasHeight = windowHeight;
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-holder');
  preyColor = color(0, 114, 189);
  predColor = color(217, 83, 25);
  frameRate(30);

  // use plain JS to get DOM elements
  sliderPrey = document.getElementById('sliderPrey');
  sliderPred = document.getElementById('sliderPred');
  pauseBtn   = document.getElementById('pauseBtn');
  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  });

  computeSolution();
}

function computeSolution() {
  let x0 = parseInt(sliderPrey.value);
  let y0 = parseInt(sliderPred.value);
  preyCurve = [x0];
  predCurve = [y0];
  tValues = [0];
  let steps = Math.floor(tmax / dt);
  for (let i = 1; i <= steps; i++) {
    let t = i * dt;
    let x = preyCurve[i - 1];
    let y = predCurve[i - 1];
    // RK4 integration
    let k1x = alpha * x - beta * x * y;
    let k1y = delta * x * y - gamma * y;
    let x2 = x + 0.5 * dt * k1x;
    let y2 = y + 0.5 * dt * k1y;
    let k2x = alpha * x2 - beta * x2 * y2;
    let k2y = delta * x2 * y2 - gamma * y2;
    let x3 = x + 0.5 * dt * k2x;
    let y3 = y + 0.5 * dt * k2y;
    let k3x = alpha * x3 - beta * x3 * y3;
    let k3y = delta * x3 * y3 - gamma * y3;
    let x4 = x + dt * k3x;
    let y4 = y + dt * k3y;
    let k4x = alpha * x4 - beta * x4 * y4;
    let k4y = delta * x4 * y4 - gamma * y4;
    let xn = x + (dt / 6) * (k1x + 2*k2x + 2*k3x + k4x);
    let yn = y + (dt / 6) * (k1y + 2*k2y + 2*k3y + k4y);
    preyCurve.push(xn);
    predCurve.push(yn);
    tValues.push(t);
  }
}

function draw() {
  background(255);
  // dimensions
  let w = width;
  let h = height / 2;
  
  // Top: time-series
  push();
  // grid
  stroke(200);
  for (let i = 0; i <= w; i += w/10) line(i, 0, i, h);
  for (let j = 0; j <= h; j += h/10) line(0, j, w, j);
  // curves
  noFill(); stroke(preyColor);
  beginShape();
  for (let i = 0; i < tValues.length; i++) {
    vertex(map(tValues[i], 0, tmax, 0, w), map(preyCurve[i], 0, max(preyCurve), h, 0));
  }
  endShape();
  stroke(predColor);
  beginShape();
  for (let i = 0; i < tValues.length; i++) {
    vertex(map(tValues[i], 0, tmax, 0, w), map(predCurve[i], 0, max(predCurve), h, 0));
  }
  endShape();
  // live text
  let x = animIndex;
  noStroke(); textSize(14);
  fill(0);               text(`t = ${tValues[x].toFixed(1)}`, 10, 20);
  fill(preyColor);       text(`N = ${floor(preyCurve[x])}`, 120, 20);
  fill(predColor);       text(`N = ${floor(predCurve[x])}`, 260, 20);
  // scan line
  stroke(0); line(map(tValues[x], 0, tmax, 0, w), 0, map(tValues[x], 0, tmax, 0, w), h);
  pop();
  
  // Bottom: agent-based
  push(); translate(0, h);
  noStroke(); fill(0,77,0); rect(0, 0, w, h);
  let nPrey = floor(preyCurve[x]);
  let nPred = floor(predCurve[x]);
  fill(preyColor);
  for (let i = 0; i < nPrey; i++) ellipse(random(w), random(h), 6);
  fill(predColor);
  for (let i = 0; i < nPred; i++) ellipse(random(w), random(h), 6);
  pop();

  if (!paused) {
    animIndex = (animIndex + 1) % tValues.length;
  }
}

function windowResized() {
  resizeCanvas(windowWidth - 220, windowHeight);
}
