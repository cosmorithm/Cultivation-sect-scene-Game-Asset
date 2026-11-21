import { rosette } from '../../ThreeJS共享/nature-garden.mjs';

const design = {
  name: "G08_草丛",
  seed: 851,
  clumps: [
    [0, 0, 0.76, 13]
  ],
  baseColor: 4683315,
  tipColor: 12044124
};

export function buildAsset(T) {
  return rosette(T, design);
}
