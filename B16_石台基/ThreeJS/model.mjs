import { Workshop, plinth, stairs, rail } from '../../ThreeJS共享/architecture.mjs';

export function buildAsset(T) {
  const s = new Workshop(T, 'B16_RaillinedStoneTerrace');
  s.section('LoadbearingPlinth');
  plinth(s,7.7,4.58,.69);
  s.section('Paving');
  for(let j=0;j<4;j++)for(let i=0;i<8;i++)s.box((i+j)%5?'stone':'stonePale',-3.80+(i+.5)*.95,.711,-2.24+(j+.5)*1.12,.937,.048,1.104);
  s.section('PerimeterBalustrade');
  rail(s,[-3.7,-2.14],[3.7,-2.14],.735,.77);
  for(const sign of [-1,1]){
   rail(s,[sign*3.70,-2.14],[sign*3.70,2.14],.735,.77);
   rail(s,[sign*1.05,2.14],[sign*3.70,2.14],.735,.77);
  }
  s.section('OpenEntry');
  stairs(s,1.85,2.30,.735,4,.255);
  return s.finish();
}
