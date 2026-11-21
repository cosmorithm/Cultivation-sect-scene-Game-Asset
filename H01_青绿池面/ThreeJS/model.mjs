import { pool } from '../../ThreeJS共享/water-flows.mjs';

const design = {
  name: "H01_青绿池面",
  seed: 311,
  width: 12.6,
  depth: 7.8,
  level: 0.52,
  period: 4.8
};

export const presentation = {"direction": [0.6, 0.78, 1.16], "floor": false, "background": 9940657};

export function buildAsset(T) {
  return pool(T, design);
}
