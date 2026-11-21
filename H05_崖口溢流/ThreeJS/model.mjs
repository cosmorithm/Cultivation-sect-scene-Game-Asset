import { overflow } from '../../ThreeJS共享/water-flows.mjs';

const design = {
  name: "H05_崖口溢流",
  seed: 365,
  sourceWidth: 4.9,
  mouth: 3.25,
  drop: 3.6,
  poolLength: 3.5,
  run: 0.96,
  period: 3.6
};

export const presentation = {"direction": [0.6, 0.78, 1.16], "floor": false, "background": 9940657};

export function buildAsset(T) {
  return overflow(T, design);
}
