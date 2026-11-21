import { bank } from '../../ThreeJS共享/water-flows.mjs';

const design = {
  name: "H02_石质池岸",
  seed: 392,
  radius: 5.4,
  width: 1.12,
  arc: 85,
  height: 0.96
};

export function buildAsset(T) {
  return bank(T, design);
}
