import { vapour } from '../../ThreeJS共享/sky-vapour.mjs';

const design = {
  name: "I05_高空云丝",
  seed: 232,
  form: "cirrus",
  width: 32,
  depth: 10,
  height: 3.2,
  puffs: 14,
  period: 19,
  opacity: 0.61,
  palette: [13885678, 14936297, 16772828]
};

export const presentation = {"floor": false, "background": 4618156, "direction": [0.16, 0.34, 1.25]};

export function buildAsset(T) {
  return vapour(T, design);
}
