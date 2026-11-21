import { shrub } from '../../ThreeJS共享/nature-garden.mjs';

const design = {
  name: "G09_低矮灌木",
  seed: 921,
  height: 1.03,
  branches: 19,
  palette: [2706485, 6259008, 10790476]
};

export function buildAsset(T) {
  return shrub(T, design);
}
