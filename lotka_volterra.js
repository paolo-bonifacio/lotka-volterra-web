// lotka_volterra.js

console.log("lotka_volterra.js loaded");

let alpha = 1.1, beta = 0.4, delta = 0.1, gamma = 0.4;
let tmax = 50, dt = 0.01;
let preyCurve = [], predCurve = [], tValues = [];
let preyColor, predColor;
let sliderPrey, sliderPred, pauseBtn;
let paused = false;
let animIndex = 0;
let yMax = 1;
let marginLeft = 60;
let dotSize = 20;
let numDotsMax = 200;

let preyDots = [], predDots = [];

function setup() {
  const w = windowWidth - 220;
  const h = windowHeight;
  let cnv = createCanvas(w, h);
  cnv.parent('canvas-holder');

  preyColor = color(0, 114, 189);
  predColor = color(217, 83, 25);
  frameRate(30);

  sliderPrey = document.getElementById('sliderPrey');
  sliderPred = document.getElementById('sliderPred');
  pauseBtn   = document.getElementById('pauseBtn');

  sliderPrey.value = 40;
  sliderPred.value = 10;

  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  });

  sliderPrey.addEventListener('input', () => { computeSolution(); animIndex = 0; });
  sliderPred.addEventListener('input', () => { computeSolution(); animIndex = 0; });

  computeSolution();
  initializeDots();
}

function initializeDots() {
  preyDots = [];
  predDots = [];
  for (let i = 0; i < numDotsMax; i++) {
    preyDots.push({
      x: random(width),
      y: random(height / 2),
      vx: random(-0.3, 0.3),
      vy: random(-0.3, 0.3)
    });
    predDots.push({
      x: random(width),
      y: random(height / 2),
      vx: random(-0.3, 0.3),
      vy: random(-0.3, 0.3)
    });
  }
}

function computeSolution() {
  const x0 = parseInt(sliderPrey.value, 10);
  const y0 = parseInt(sliderPred.value, 10);
  preyCurve = [x0]; predCurve = [y0]; tValues = [0];

  const steps = Math.floor(tmax / dt);
  for (let i = 1; i <= steps; i++) {
    const x = preyCurve[i - 1], y = predCurve[i - 1];

    const k1x = alpha*x - beta*x*y;
    const k1y = delta*x*y - gamma*y;
    const x2 = x + 0.5*dt*k1x, y2 = y + 0.5*dt*k1y;
    const k2x = alpha*x2 - beta*x2*y2;
    const k2y = delta*x2*y2 - gamma*y2;
    const x3 = x + 0.5*dt*k2x, y3 = y + 0.5*dt*k2y;
    const k3x = alpha*x3 - beta*x3*y3;
    const k3y = delta*x3*y3 - gamma*y3;
    const x4 = x + dt*k3x, y4 = y + dt*k3y;
    const k4x = alpha*x4 - beta*x4*y4;
    const k4y = delta*x4*y4 - gamma*y4;
    const xn = x + (dt/6)*(k1x + 2*k2x + 2*k3x + k4x);
    const yn = y + (dt/6)*(k1y + 2*k2y + 2*k3y + k4y);

    preyCurve.push(xn);
    predCurve.push(yn);
    tValues.push(i * dt);
  }

  yMax = Math.max(...preyCurve, ...predCurve);
}

function draw() {
  background(255);
  const w = width, h = height / 2;

  // Title and parameter info
  textAlign(CENTER);
  fill(0); textSize(25);
  text(`Lotka-Volterra Model: α=${alpha.toFixed(2)}, β=${beta.toFixed(2)}, δ=${delta.toFixed(2)}, γ=${gamma.toFixed(2)}`, width / 2, 20);

  push();
  // Grid lines
  stroke(220);
  for (let i = 0; i <= 10; i++) {
    const x = map(i * (tmax / 10), 0, tmax, marginLeft, width);
    line(x, 0, x, h);
  }
  for (let j = 0; j <= 10; j++) {
    const y = j * h / 10;
    line(marginLeft, y, width, y);
  }

  // Y-axis
  stroke(0);
  line(marginLeft, 0, marginLeft, h);
  textSize(18);
  fill(0);
  textAlign(RIGHT, CENTER);
  for (let j = 0; j <= 10; j++) {
    const val = (yMax / 10) * j;
    const y = map(val, 0, yMax, h, 0);
    line(marginLeft - 5, y, marginLeft, y);
    text(val.toFixed(0), marginLeft - 8, y);
  }

  // Y-axis label
  push();
  translate(15, h / 2);
  rotate(-HALF_PI);
  textAlign(CENTER);
  text("Population", 0, 0);
  pop();

  // Curves
  noFill(); strokeWeight(2.5);
  stroke(preyColor); beginShape();
  for (let i = 0; i < tValues.length; i++) {
    const x = map(tValues[i], 0, tmax, marginLeft, width);
    const y = map(preyCurve[i], 0, yMax, h, 0);
    vertex(x, y);
  }
  endShape();

  stroke(predColor); beginShape();
  for (let i = 0; i < tValues.length; i++) {
    const x = map(tValues[i], 0, tmax, marginLeft, width);
    const y = map(predCurve[i], 0, yMax, h, 0);
    vertex(x, y);
  }
  endShape();
  strokeWeight(1);

  // Vertical time marker and labels
  const idx = animIndex;
  const xLine = map(tValues[idx], 0, tmax, marginLeft, width);
  stroke(0); line(xLine, 0, xLine, h);
  noStroke(); textSize(25); textAlign(LEFT);
  fill(0);         text(`t = ${tValues[idx].toFixed(1)}`, marginLeft + 10, 40);
  fill(preyColor); text(`Prey = ${floor(preyCurve[idx])}`, marginLeft + 150, 40);
  fill(predColor); text(`Pred = ${floor(predCurve[idx])}`, marginLeft + 300, 40);
  pop();

  // Bottom simulation section
  push();
  translate(0, h);
  noStroke(); fill(0, 77, 0); rect(0, 0, width, h);

  let nPrey = constrain(floor(preyCurve[animIndex]), 0, numDotsMax);
  let nPred = constrain(floor(predCurve[animIndex]), 0, numDotsMax);

  fill(preyColor);
  for (let i = 0; i < nPrey; i++) {
    let dot = preyDots[i];
    if (!paused) {
      dot.vx += random(-0.02, 0.02);
      dot.vy += random(-0.02, 0.02);
      dot.vx = constrain(dot.vx, -0.5, 0.5);
      dot.vy = constrain(dot.vy, -0.5, 0.5);
      dot.x += dot.vx;
      dot.y += dot.vy;
      dot.x = constrain(dot.x, 0, width);
      dot.y = constrain(dot.y, 0, h);
    }
    ellipse(dot.x, dot.y, dotSize);
  }

  fill(predColor);
  for (let i = 0; i < nPred; i++) {
    let dot = predDots[i];
    if (!paused) {
      dot.vx += random(-0.02, 0.02);
      dot.vy += random(-0.02, 0.02);
      dot.vx = constrain(dot.vx, -0.5, 0.5);
      dot.vy = constrain(dot.vy, -0.5, 0.5);
      dot.x += dot.vx;
      dot.y += dot.vy;
      dot.x = constrain(dot.x, 0, width);
      dot.y = constrain(dot.y, 0, h);
    }
    ellipse(dot.x, dot.y, dotSize);
  }

  pop();

  // Final draw: x-axis for time on top of everything
  const axisY = height / 2 - 5;
  stroke(0);
  line(marginLeft, axisY, width, axisY);
  textAlign(CENTER, TOP); textSize(18); noStroke();
  for (let i = 0; i <= 10; i++) {
    const t = (tmax / 10) * i;
    const x = map(t, 0, tmax, marginLeft, width);
    stroke(0);
    line(x, axisY, x, axisY + 5);
    noStroke();
    text(t.toFixed(0), x, axisY + 8);
  }
  text("Time", (marginLeft + width) / 2, axisY + 30);

  if (!paused) animIndex = (animIndex + 1) % tValues.length;
}

function windowResized() {
  resizeCanvas(windowWidth - 220, windowHeight);
}
