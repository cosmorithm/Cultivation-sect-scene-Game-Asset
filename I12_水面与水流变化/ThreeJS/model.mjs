import { overflow } from '../../ThreeJS共享/water-flows.mjs';

const design = {
  name: "I12_水面与水流变化",
  seed: 844,
  sourceWidth: 7.95,
  mouth: 4.4,
  drop: 4.59,
  poolLength: 5.05,
  run: 1.51,
  period: 3.4,
  impact: true
};

export const presentation = {"direction": [0.65, 0.77, 1.22], "floor": false, "background": 7902619};

export function buildAsset(T) {
  return overflow(T, design);
}
