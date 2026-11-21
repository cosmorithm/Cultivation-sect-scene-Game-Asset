import { waterfall } from '../../ThreeJS共享/water-flows.mjs';

const design = {
  name: "H04_细股瀑布",
  seed: 772,
  period: 2.9,
  curtains: [
    [-0.56, 6.7, 0.03, 0.23, 6.7, 0.55],
    [0, 6.82, 0, 0.27, 6.82, 0.69],
    [0.57, 6.74, -0.13, 0.17, 6.74, 0.44]
  ]
};

export const presentation = {"direction": [0.57, 0.41, 1.14], "floor": false, "background": 4611440};

export function buildAsset(T) {
  return waterfall(T, design);
}
