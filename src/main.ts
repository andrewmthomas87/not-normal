import "./reset.css";
import { initSimulation, renderSimulation, stepSimulation } from "./simulation";
import "./style.css";

const canvas = document.getElementById("canvas");
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("invalid state");

const W = Math.trunc(window.innerWidth / 2);
const H = Math.trunc(window.innerHeight / 2);

canvas.width = W;
canvas.height = H;

const ctx = canvas.getContext("2d", { alpha: false });
if (!ctx) throw new Error("invalid state");

const sim = initSimulation(() => Math.random(), ctx, W, H, {
	pTreeGrowth: 0.001,
	pLightning: 0.000001,
	pFireSpread: 0.4,
	pOnFireToBurned: 0.6,
	pBurnedToNone: 0.05,
});
renderSimulation(sim);

const STEPS_PER_SECOND = 20;
const STEP_MS = 1000 / STEPS_PER_SECOND;

let lastTime = performance.now();
let accumulator = 0;

function loop(now: number) {
	const frameTime = now - lastTime;
	lastTime = now;
	accumulator += frameTime;

	if (accumulator >= STEP_MS) {
		accumulator -= STEP_MS;

		stepSimulation(sim);
		renderSimulation(sim);
	}

	requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
