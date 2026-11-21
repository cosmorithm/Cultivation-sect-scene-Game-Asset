import { lotus } from '../../ThreeJS共享/nature-garden.mjs';

const design = {
  name: "G14_水生浮叶",
  seed: 911,
  pads: [
    [-0.43, -0.18, 0.46, 0.17, 0.3],
    [0.19, 0.35, 0.53, 0.16, 1.6],
    [0.51, -0.3, 0.37, 0.23, 2.2],
    [-0.33, 0.42, 0.22, 0.13, 3.7],
    [-0.56, -0.58, 0.22, 0.33, 1.8]
  ],
  bloom: [0.03, 0.6, -0.18]
};

export function buildAsset(T) {
  return lotus(T, design);
}
