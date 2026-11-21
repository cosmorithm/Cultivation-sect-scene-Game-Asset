import { waterfall } from '../../ThreeJS共享/water-flows.mjs';

const design = {
  name: "H03_宽水帘瀑布",
  seed: 333,
  period: 3.4,
  curtains: [
    [0, 9.5, 0, 7.7, 9.5, 1.2]
  ]
};

export const presentation = {"direction": [0.57, 0.41, 1.14], "floor": false, "background": 4611440};

export function buildAsset(T) {
  return waterfall(T, design);
}
