import { vapour } from '../../ThreeJS共享/sky-vapour.mjs';

const design = {
  name: "I02_山间云带",
  seed: 556,
  form: "band",
  width: 27,
  depth: 12,
  height: 2.5,
  puffs: 28,
  period: 11,
  opacity: 0.72,
  palette: [10928604, 13688037, 15199455]
};

export const presentation = {"floor": false, "background": 4549782, "direction": [0.47, 0.56, 1.16]};

export function buildAsset(T) {
  return vapour(T, design);
}
