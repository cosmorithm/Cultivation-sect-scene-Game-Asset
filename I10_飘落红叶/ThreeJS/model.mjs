import { driftingLeaves } from '../../ThreeJS共享/nature-flight.mjs';

const design = {
  name: "I10_飘落红叶",
  seed: 752,
  leaves: 5,
  width: 0.94,
  fall: 1.06,
  leafSize: 0.126,
  period: 6.5,
  palette: [9454377, 13847605, 15960646]
};

export const presentation = {"floor": false, "background": 14802644, "direction": [0.24, 0.53, 1.2]};

export function buildAsset(T) {
  return driftingLeaves(T, design);
}
