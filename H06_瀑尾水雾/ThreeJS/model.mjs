import { vapour } from '../../ThreeJS共享/sky-vapour.mjs';

const design = {
  name: "H06_瀑尾水雾",
  seed: 354,
  form: "spray",
  width: 7.1,
  depth: 3.8,
  height: 2.9,
  puffs: 18,
  period: 3.8,
  opacity: 0.6,
  palette: [10009807, 13296360, 15135215]
};

export const presentation = {"direction": [0.57, 0.41, 1.14], "floor": false, "background": 4611440};

export function buildAsset(T) {
  return vapour(T, design);
}
