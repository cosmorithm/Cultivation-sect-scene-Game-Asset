import { crane } from '../../ThreeJS共享/nature-flight.mjs';

const design = {
  name: "I09_白色飞鸟",
  seed: 57,
  period: 2.2
};

export const presentation = {"floor": false, "background": 9284540, "direction": [0.56, 1.18, 1.01]};

export function buildAsset(T) {
  return crane(T, design);
}
