import { banner } from '../../ThreeJS共享/nature-banner.mjs';

const design = {
  name: "I11_旗幡摆动",
  width: 0.73,
  height: 2.25,
  hangerSpacing: 0.55,
  period: 5.1
};

export const presentation = {"direction": [0.27, 0.18, 1.25]};

export function buildAsset(T) {
  return banner(T, design);
}
