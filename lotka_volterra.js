// lotka_volterra.js

console.log("lotka_volterra.js loaded");

let alpha = 1.1, beta = 0.4, delta = 0.1, gamma = 0.4;
let tmax = 50, dt = 0.05;
let preyCurve = [], predCurve = [], tValues = [];
let preyColor, predColor;
let sliderPrey, sliderPred, pauseBtn;
let paused = false;
let animIndex = 0;

function setup() {
  // create p5 canvas in the holder
  const w = windowWidth - 220;
  const h = windowHeight;
  let cnv = createCanvas(w, h);
  cnv.parent('canvas-holder');

  // initialize colors and frame rate
  preyColor = color(0, 114, 189);
  predColor = color(217, 83, 25);
  frameRate(30);

  // get controls
  sliderPrey = document.getElementById('sliderPrey');
  sliderPred = document.getElementById('sliderPred');
  pauseBtn   = document.getElementById('pauseBtn');

  // pause/resume toggle
  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  });

  // recompute when sliders change
  sliderPrey.addEventListener('input', () => { computeSolution(); animIndex = 0; });
  sliderPred.addEventListener('input', () => { computeSolution(); animIndex = 0; });

  // initial computation
  computeSolution();
}

function computeSolution() {
  const x0 = parseInt(sliderPrey.value, 10);
  const y0 = parseInt(sliderPred.value, 10);
  preyCurve = [x0]; predCurve = [y0]; tValues = [0];
  const steps = Math.floor(tmax / dt);
  for (let i = 1; i <= steps; i++) {
    const x = preyCurve[i - 1], y = predCurve[i - 1];
    // RK4
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
    preyCurve.push(xn); predCurve.push(yn); tValues.push(i*dt);
  }
}

function draw() {
  background(255);
  const w = width, h = height/2;
  // top: time series
  push();
  stroke(200);
  for (let i = 0; i <= 10; i++) line((w/10)*i,0,(w/10)*i,h);
  for (let j = 0; j <= 10; j++) line(0,(h/10)*j,w,(h/10)*j);
  noFill(); stroke(preyColor); beginShape();
  for (let i=0;i<tValues.length;i++) vertex(map(tValues[i],0,tmax,0,w), map(preyCurve[i],0,max(preyCurve),h,0));
  endShape();
  stroke(predColor); beginShape();
  for (let i=0;i<tValues.length;i++) vertex(map(tValues[i],0,tmax,0,w), map(predCurve[i],0,max(predCurve),h,0));
  endShape();
  const idx = animIndex;
  noStroke(); textSize(14);
  fill(0);         text(`t = ${tValues[idx].toFixed(1)}`,10,20);
  fill(preyColor); text(`N = ${floor(preyCurve[idx])}`,120,20);
  fill(predColor); text(`N = ${floor(predCurve[idx])}`,260,20);
  stroke(0); line(map(tValues[idx],0,tmax,0,w),0,map(tValues[idx],0,tmax,0,w),h);
  pop();
  // bottom: agents
  push(); translate(0,h);
  noStroke(); fill(0,77,0); rect(0,0,w,h);
  const nPrey=floor(preyCurve[animIndex]), nPred=floor(predCurve[animIndex]);
  fill(preyColor);
  for(let i=0;i<nPrey;i++) ellipse(random(w),random(h),6);
  fill(predColor);
  for(let i=0;i<nPred;i++) ellipse(random(w),random(h),6);
  pop();
  if(!paused) animIndex = (animIndex+1)%tValues.length;
}

function windowResized(){
  resizeCanvas(windowWidth-220,windowHeight);
}
