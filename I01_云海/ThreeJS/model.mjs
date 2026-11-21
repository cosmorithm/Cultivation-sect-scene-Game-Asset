import { vapour } from '../../ThreeJS共享/sky-vapour.mjs';

const design = {
  name: "I01_云海",
  seed: 481,
  form: "sea",
  width: 38,
  depth: 26,
  height: 4.2,
  puffs: 55,
  period: 14.5,
  opacity: 0.85,
  palette: [9347775, 14084813, 16773596]
};

export const presentation = {"floor": false, "background": 4549782, "direction": [0.47, 0.56, 1.16]};

export function buildAsset(T) {
  return vapour(T, design);
}
