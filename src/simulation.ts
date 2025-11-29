const stateNone = 0;
const stateTree = 1;
const stateTreeOnFire = 2;
const stateTreeBurned = 3;

const colors: [number, number, number][] = [
	[121, 104, 60],
	[34, 102, 52],
	[228, 111, 40],
	[46, 43, 42],
];

export type Simulation = {
	rand: () => number;
	ctx: CanvasRenderingContext2D;

	w: number;
	h: number;
	config: SimulationConfig;

	n: number;
	state: Uint8Array;
	nextState: Uint8Array;

	imageData: ImageData;
};

type SimulationConfig = {
	pTreeGrowth: number;
	pLightning: number;
	pFireSpread: number;
	pOnFireToBurned: number;
	pBurnedToNone: number;
};

export function initSimulation(
	rand: () => number,
	ctx: CanvasRenderingContext2D,
	w: number,
	h: number,
	config: SimulationConfig,
): Simulation {
	return {
		rand,
		ctx,
		w,
		h,
		config,
		n: 0,
		state: new Uint8Array(w * h),
		nextState: new Uint8Array(w * h),
		imageData: ctx.createImageData(w, h),
	};
}

export function stepSimulation(sim: Simulation) {
	sim.n++;

	for (let y = 0; y < sim.h; y++) {
		for (let x = 0; x < sim.w; x++) {
			stepState(sim, x, y);
		}
	}

	[sim.state, sim.nextState] = [sim.nextState, sim.state];
}

export function stepState(sim: Simulation, x: number, y: number) {
	const i = y * sim.w + x;
	const state = sim.state[i];

	switch (state) {
		case stateNone: {
			const neighborTreeWeight = getNeighbors(x, y, sim.w, sim.h)
				.map(([nx, ny]): number => {
					const ni = ny * sim.w + nx;
					const nstate = sim.state[ni];

					if (nstate === stateTree) return 1;
					else if (nstate === stateTreeBurned) return -1;
					else return 0;
				})
				.reduce((prev, curr) => prev + curr, 0);
			if (
				sim.rand() <
				(Math.min(neighborTreeWeight, 2) + 0.5) * sim.config.pTreeGrowth
			)
				sim.nextState[i] = stateTree;
			else sim.nextState[i] = stateNone;
			break;
		}
		case stateTree: {
			const neighborsOnFireCount = getNeighbors(x, y, sim.w, sim.h).filter(
				([nx, ny]) => {
					const ni = ny * sim.w + nx;
					const nstate = sim.state[ni];

					return nstate === stateTreeOnFire;
				},
			).length;
			if (
				sim.rand() <
				sim.config.pLightning + neighborsOnFireCount * sim.config.pFireSpread
			)
				sim.nextState[i] = stateTreeOnFire;
			else sim.nextState[i] = stateTree;
			break;
		}
		case stateTreeOnFire:
			if (sim.rand() < sim.config.pOnFireToBurned)
				sim.nextState[i] = stateTreeBurned;
			else sim.nextState[i] = stateTreeOnFire;
			break;
		case stateTreeBurned:
			if (sim.rand() < sim.config.pBurnedToNone) sim.nextState[i] = stateNone;
			else sim.nextState[i] = stateTreeBurned;
			break;
	}
}

function getNeighbors(x: number, y: number, w: number, h: number) {
	const neighbors: [number, number][] = [];
	if (x > 0) neighbors.push([x - 1, y]);
	if (x + 1 < w) neighbors.push([x + 1, y]);
	if (y > 0) neighbors.push([x, y - 1]);
	if (y + 1 < h) neighbors.push([x, y + 1]);

	return neighbors;
}

export function renderSimulation(sim: Simulation) {
	for (let y = 0; y < sim.h; y++) {
		for (let x = 0; x < sim.w; x++) {
			const i = y * sim.w + x;
			const state = sim.state[i];
			const color = colors[state];

			sim.imageData.data[i * 4] = color[0];
			sim.imageData.data[i * 4 + 1] = color[1];
			sim.imageData.data[i * 4 + 2] = color[2];
			sim.imageData.data[i * 4 + 3] = 255;
		}
	}

	sim.ctx.putImageData(sim.imageData, 0, 0);
}
