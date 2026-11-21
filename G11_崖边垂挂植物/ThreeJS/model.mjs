import { hanging } from '../../ThreeJS共享/nature-garden.mjs';

const design = {
  name: "G11_崖边垂挂植物",
  seed: 923,
  length: 1.71,
  width: 2.64,
  tendrils: [
    [-1.02, 0.94, 0.075],
    [-0.62, 1.6, 0.1],
    [-0.19, 0.74, 0.052],
    [0.22, 1.26, 0.08],
    [0.64, 0.85, 0.075],
    [0.97, 0.5, 0.05]
  ]
};

export function buildAsset(T) {
  return hanging(T, design);
}
