// lotka_volterra.js (FULL VERSION with epsilon replacing delta)

let alpha = 0.1, beta = 0.002, gamma = 0.2, epsilon = 1.0;
let delta = epsilon * beta;

let tmax = 150, dt = 0.01;
let preyCurve = [], predCurve = [], tValues = [];
let preyColor, predColor;
let sliderPrey, sliderPred, sliderAlpha, sliderBeta, sliderGamma, sliderEpsilon, pauseBtn;
let paused = false;
let animIndex = 0;
let yMax = 1;
let dotSize = 20;
let numDotsMax = 200;

let preyDots = [], predDots = [];

function setup() {
  const controlPanelWidth = 140;
  const paramPanelWidth = 180;
  const canvasWidth = windowWidth - controlPanelWidth - paramPanelWidth;
  const canvasHeight = windowHeight;
  let cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent('canvas-holder');

  preyColor = color(0, 114, 189);
  predColor = color(217, 83, 25);
  frameRate(30);

  sliderPrey = document.getElementById('sliderPrey');
  sliderPred = document.getElementById('sliderPred');
  sliderAlpha = document.getElementById('sliderAlpha');
  sliderBeta  = document.getElementById('sliderBeta');
  sliderGamma = document.getElementById('sliderGamma');
  sliderEpsilon = document.getElementById('sliderEpsilon');
  pauseBtn   = document.getElementById('pauseBtn');

  sliderPrey.addEventListener('input', () => { computeSolution(); animIndex = 0; });
  sliderPred.addEventListener('input', () => { computeSolution(); animIndex = 0; });
  sliderAlpha.addEventListener('input', () => {
    alpha = parseFloat(sliderAlpha.value);
    computeSolution(); animIndex = 0;
  });
  sliderBeta.addEventListener('input', () => {
    beta = parseFloat(sliderBeta.value);
    delta = epsilon * beta;
    computeSolution(); animIndex = 0;
  });
  sliderGamma.addEventListener('input', () => {
    gamma = parseFloat(sliderGamma.value);
    computeSolution(); animIndex = 0;
  });
  sliderEpsilon.addEventListener('input', () => {
    epsilon = parseFloat(sliderEpsilon.value);
    delta = epsilon * beta;
    computeSolution(); animIndex = 0;
  });

  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  });

  computeSolution();
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

function windowResized() {
  const controlPanelWidth = 140;
  const paramPanelWidth = 180;
  resizeCanvas(windowWidth - controlPanelWidth - paramPanelWidth, windowHeight);
  preyDots = [];
  predDots = [];
}

function draw() {
  background(255);
  const w = width;
  const hTotal = height;
  const hPlot = hTotal * 0.45;
  const gap = hTotal * 0.05;

  const simBoxSize = min(w, hTotal * 0.35);
  const simTop = hPlot + gap + 60;
  const simLeft = (w - simBoxSize) / 2;

  if (preyDots.length === 0 || predDots.length === 0) {
    initializeDots(simLeft, simTop, simBoxSize);
  }

  const graphLeft = 60;
  const graphRight = width - 20;

  textAlign(CENTER); fill(0); textSize(24);
  text(`Lotka-Volterra Model: α=${alpha}, β=${beta}, γ=${gamma}, ε=${epsilon}, δ=ε×β=${delta.toFixed(4)}`, width / 2, 25);

  stroke(0);
  line(graphLeft, 0, graphLeft, hPlot);
  fill(0); textSize(16); textAlign(RIGHT, CENTER); noStroke();
  for (let j = 0; j <= 10; j++) {
    const val = (yMax / 10) * j;
    const y = map(val, 0, yMax, hPlot, 0);
    stroke(0);
    line(graphLeft - 5, y, graphLeft, y);
    noStroke();
    text(val.toFixed(0), graphLeft - 10, y);
  }

  push(); translate(25, hPlot / 2); rotate(-HALF_PI);
  textAlign(CENTER); text("Population", 0, 0); pop();

  stroke(220);
  for (let i = 0; i <= 10; i++) {
    const x = map(i * (tmax / 10), 0, tmax, graphLeft, graphRight);
    line(x, 0, x, hPlot);
  }
  for (let j = 0; j <= 10; j++) {
    const y = j * hPlot / 10;
    line(graphLeft, y, graphRight, y);
  }

  noFill(); strokeWeight(2.5);
  stroke(preyColor); beginShape();
  for (let i = 0; i < tValues.length; i++) {
    const x = map(tValues[i], 0, tmax, graphLeft, graphRight);
    const y = map(preyCurve[i], 0, yMax, hPlot, 0);
    vertex(x, y);
  }
  endShape();

  stroke(predColor); beginShape();
  for (let i = 0; i < tValues.length; i++) {
    const x = map(tValues[i], 0, tmax, graphLeft, graphRight);
    const y = map(predCurve[i], 0, yMax, hPlot, 0);
    vertex(x, y);
  }
  endShape();
  strokeWeight(1);

  const idx = animIndex;
  const xLine = map(tValues[idx], 0, tmax, graphLeft, graphRight);
  stroke(0); strokeWeight(1);
  line(xLine, 0, xLine, hPlot);

  const axisY = hPlot;
  stroke(0); line(graphLeft, axisY, graphRight, axisY);
  textSize(16); textAlign(CENTER, TOP);
  for (let i = 0; i <= 10; i++) {
    const t = (tmax / 10) * i;
    const x = map(t, 0, tmax, graphLeft, graphRight);
    stroke(0); line(x, axisY, x, axisY + 6);
    noStroke(); fill(0); text(t.toFixed(0), x, axisY + 10);
  }
  fill(0); noStroke(); textSize(18);
  text("Time", (graphLeft + graphRight) / 2, axisY + 35);

  textSize(24); textAlign(LEFT); noStroke();
  fill(0); text(`t = ${tValues[animIndex].toFixed(1)}`, graphLeft + 10, 40);
  fill(preyColor); text(`Prey = ${floor(preyCurve[animIndex])}`, graphLeft + 220, 40);
  fill(predColor); text(`Pred = ${floor(predCurve[animIndex])}`, graphLeft + 400, 40);

  const initialPrey = parseInt(sliderPrey.value, 10);
  const initialPred = parseInt(sliderPred.value, 10);
  fill(preyColor); text(`Initial Prey = ${initialPrey}`, graphLeft + 220, 70);
  fill(predColor); text(`Initial Pred = ${initialPred}`, graphLeft + 400, 70);

  const infoX = 30;
  const infoY = simTop;
  const lineHeight = 22;
  const boxWidth = 320;
  const boxHeight = 6 * lineHeight + 20;

  fill(255); stroke(0); strokeWeight(1);
  rect(infoX, infoY, boxWidth, boxHeight);

  noStroke();
  fill(0); textSize(16); textAlign(LEFT, TOP);
  text("Model Parameters:", infoX + 10, infoY + 10);
  text("α: Prey reproduction rate", infoX + 10, infoY + 10 + lineHeight);
  text("β: Predation rate (prey eaten)", infoX + 10, infoY + 10 + 2 * lineHeight);
  text("ε: Conversion efficiency (prey → predator)", infoX + 10, infoY + 10 + 3 * lineHeight);
  text("δ = ε × β = " + delta.toFixed(4), infoX + 10, infoY + 10 + 4 * lineHeight);
  text("γ: Predator death rate", infoX + 10, infoY + 10 + 5 * lineHeight);

  fill(0); noStroke(); textSize(20); textAlign(CENTER);
  text("Ecosystem Simulation", width / 2, simTop - 20);

  push();
  fill(34, 139, 34); stroke(0); strokeWeight(2);
  rect(simLeft, simTop, simBoxSize, simBoxSize);

  let nPrey = constrain(floor(preyCurve[animIndex]), 0, numDotsMax);
  let nPred = constrain(floor(predCurve[animIndex]), 0, numDotsMax);

  updateDots(preyDots, nPrey, simLeft, simTop, simBoxSize, preyColor);
  updateDots(predDots, nPred, simLeft, simTop, simBoxSize, predColor);

  pop();

  if (!paused) animIndex = (animIndex + 1) % tValues.length;
}

function initializeDots(left, top, size) {
  preyDots = [];
  predDots = [];
  for (let i = 0; i < numDotsMax; i++) {
    preyDots.push(createDot(left, top, size));
    predDots.push(createDot(left, top, size));
  }
}

function createDot(left, top, size) {
  return {
    x: random(left + dotSize / 2, left + size - dotSize / 2),
    y: random(top + dotSize / 2, top + size - dotSize / 2),
    vx: random(-0.3, 0.3),
    vy: random(-0.3, 0.3)
  };
}

function updateDots(dots, count, left, top, size, col) {
  fill(col);
  for (let i = 0; i < count; i++) {
    let dot = dots[i];
    if (!paused) {
      dot.vx += random(-0.02, 0.02);
      dot.vy += random(-0.02, 0.02);
      dot.vx = constrain(dot.vx, -0.5, 0.5);
      dot.vy = constrain(dot.vy, -0.5, 0.5);
      dot.x += dot.vx;
      dot.y += dot.vy;
      const margin = dotSize / 2 + 2;
      if (dot.x <= left + margin || dot.x >= left + size - margin) dot.vx += random(-0.2, 0.2);
      if (dot.y <= top + margin || dot.y >= top + size - margin) dot.vy += random(-0.2, 0.2);
      dot.x = constrain(dot.x, left + dotSize / 2, left + size - dotSize / 2);
      dot.y = constrain(dot.y, top + dotSize / 2, top + size - dotSize / 2);
    }
    ellipse(dot.x, dot.y, dotSize);
  }
}
