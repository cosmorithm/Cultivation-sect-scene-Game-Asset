import { vapour } from '../../ThreeJS共享/sky-vapour.mjs';

const design = {
  name: "I03_山间薄雾",
  seed: 919,
  form: "valley",
  width: 17,
  depth: 9,
  height: 3.3,
  puffs: 21,
  period: 15.5,
  opacity: 0.37,
  palette: [10729929, 12964822, 14279652]
};

export const presentation = {"floor": false, "background": 3492192, "direction": [0.46, 0.32, 1.2]};

export function buildAsset(T) {
  return vapour(T, design);
}
