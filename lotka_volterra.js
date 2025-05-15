/* sim.js */
// Lotka-Volterra simulation with time-series and agent-based views
let alpha = 1.1, beta = 0.4, delta = 0.1, gamma = 0.4;
let tmax = 50, dt = 0.05;
let preyCurve = [], predCurve = [], tValues = [];
let preyColor, predColor;
let sliderPrey, sliderPred, pauseBtn;
let paused = false;
let canvas;

function setup() {
  // attach p5 canvas
  canvas = createCanvas(windowWidth - 220, windowHeight);
  canvas.parent('canvas-holder');
  preyColor = color(0, 114, 189);
  predColor = color(217, 83, 25);
  frameRate(30);

  // UI elements
  sliderPrey = select('#sliderPrey');
  sliderPred = select('#sliderPred');
  pauseBtn = select('#pauseBtn');
  pauseBtn.mousePressed(() => paused = !paused);

  computeSolution();
}

function computeSolution() {
  // read initial conditions
  let x0 = floor(sliderPrey.value());
  let y0 = floor(sliderPred.value());

  // initialize arrays
  preyCurve = [x0]; predCurve = [y0]; tValues = [0];
  let steps = floor(tmax / dt);
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

let animIndex = 0;
function draw() {
  background(255);
  // left: time-series
  push();
  translate(0, 0);
  strokeWeight(2);
  // grid
  stroke(200);
  for (let i = 0; i <= width; i += 50) line(i, 0, i, height / 2);
  for (let j = 0; j <= height/2; j += 50) line(0, j, width, j);
  // curves
  stroke(preyColor);
  noFill(); beginShape();
  for (let i = 0; i < tValues.length; i++) vertex(map(tValues[i], 0, tmax, 0, width), map(preyCurve[i], 0, max(preyCurve), height/2, 0));
  endShape();
  stroke(predColor);
  beginShape();
  for (let i = 0; i < tValues.length; i++) vertex(map(tValues[i], 0, tmax, 0, width), map(predCurve[i], 0, max(predCurve), height/2, 0));
  endShape();
  // live text
  let x = animIndex;
  fill(0);
  noStroke(); textSize(14);
  text(`t = ${tValues[x].toFixed(1)}`, 10, 20);
  fill(preyColor); text(`N = ${floor(preyCurve[x])}`, 120, 20);
  fill(predColor); text(`N = ${floor(predCurve[x])}`, 260, 20);
  // scan line
  stroke(0);
  line(map(tValues[x], 0, tmax, 0, width), 0, map(tValues[x], 0, tmax, 0, width), height/2);
  pop();

  // right: agent-based
  let halfH = height/2;
  push(); translate(0, halfH);
  // background
  noStroke(); fill(0, 77, 0); rect(0, 0, width, halfH);
  // agents
  let nPrey = floor(preyCurve[x]);
  let nPred = floor(predCurve[x]);
  fill(preyColor); noStroke();
  for (let i = 0; i < nPrey; i++) ellipse(random(width), random(halfH), 6);
  fill(predColor);
  for (let i = 0; i < nPred; i++) ellipse(random(width), random(halfH), 6);
  pop();

  if (!paused) {
    animIndex = (animIndex + 1) % tValues.length;
  }
}

function windowResized() {
  resizeCanvas(windowWidth - 220, windowHeight);
}
