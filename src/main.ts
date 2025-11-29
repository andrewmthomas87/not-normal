import "./reset.css";
import { initSimulation, renderSimulation, stepSimulation } from "./simulation";
import "./style.css";

const canvas = document.getElementById("canvas");
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("invalid state");

const W = Math.trunc(window.innerWidth / 4);
const H = Math.trunc(window.innerHeight / 4);

canvas.width = W;
canvas.height = H;

const ctx = canvas.getContext("2d", { alpha: false });
if (!ctx) throw new Error("invalid state");

const sim = initSimulation(() => Math.random(), ctx, W, H, {
	pTreeGrowth: 0.00075,
	pLightning: 0.000003,
	pFireSpread: 0.333,
	pOnFireToBurned: 0.4875,
	pBurnedRelight: 0.5,
	pBurnedToNone: 0.075,
});
renderSimulation(sim);

const STEPS_PER_SECOND = 40;
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
