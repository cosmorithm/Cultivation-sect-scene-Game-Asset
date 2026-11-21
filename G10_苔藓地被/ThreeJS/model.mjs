import { moss } from '../../ThreeJS共享/nature-garden.mjs';

const design = {
  name: "G10_苔藓地被",
  seed: 923,
  lobes: [
    [-0.65, -0.2, 0.4],
    [-0.16, -0.3, 0.41],
    [0.44, 0.0, 0.52],
    [0.14, 0.32, 0.33],
    [-0.5, 0.35, 0.35],
    [0.71, -0.42, 0.22]
  ],
  palette: [4548405, 8627020, 12173153]
};

export function buildAsset(T) {
  return moss(T, design);
}
