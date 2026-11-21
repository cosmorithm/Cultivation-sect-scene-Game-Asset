import { flowerClump } from '../../ThreeJS共享/nature-garden.mjs';

const design = {
  name: "G12_白色小花簇",
  seed: 77,
  heads: [
    [-0.26, 0.43, 0.2, 0.082],
    [0.1, 0.63, 0.1, 0.099],
    [0.3, 0.48, -0.1, 0.092],
    [-0.18, 0.58, -0.13, 0.105],
    [0.04, 0.4, 0.29, 0.076],
    [-0.03, 0.7, -0.29, 0.089]
  ]
};

export function buildAsset(T) {
  return flowerClump(T, design);
}
