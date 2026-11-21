import { rosette } from '../../ThreeJS共享/nature-garden.mjs';

const design = {
  name: "G13_池岸植物",
  seed: 279,
  clumps: [
    [0, 0, 0.89, 12],
    [-0.32, 0.09, 0.39, 6],
    [0.24, 0.14, 0.48, 7]
  ],
  wet: true,
  baseColor: 3235646,
  tipColor: 9415793
};

export function buildAsset(T) {
  return rosette(T, design);
}
