import { Workshop, plinth, roof } from '../../ThreeJS共享/architecture.mjs';
import { windowRadiance } from '../../ThreeJS共享/sky-lighting.mjs';

export const presentation={background:0x374351,floorColor:0x555860,studioLightScale:.27,direction:[.27,.19,1.53],reverseDirection:[-.98,.40,-.76]};
export function buildAsset(T){
  const s=new Workshop(T,'I08_IlluminatedWindow');
  s.section('StoneSill');
  plinth(s,4.52,1.23,.52);
  s.section('CarvedWindowFrame');
  for(const x of [-2.0,2.0]){
    s.box('heartwood',x,1.94,0,.33,2.86,.61);
    s.box('bronze',x,.65,0,.35,.06,.64);
    s.box('heartwood',x,3.33,0,.44,.23,.72);
  }
  for(const y of [.64,3.08])s.box('walnut',0,y,.0,4.02,.19,.58);
  s.box('heartwood',0,1.88,-.47,3.88,2.72,.19);
  s.section('FourRuyiLatticeCasements');
  for(let j=0;j<4;j++){
    const x=(j-1.5)*.86,y=1.88,w=.82,h=2.24;
    for(const side of [-1,1]){
      s.box('walnut',x+side*w*.5,y,.322,.07,h,.084);
      s.box('walnut',x,y+side*h*.5,.322,w,.07,.084);
      for(const corner of [-1,1]){
        const xx=x+side*.34,yy=y+corner*.98;
        s.rod('heartwood',[[xx,yy-corner*.14,.376],[xx-side*.13,yy-corner*.14,.376],[xx-side*.13,yy,.376],[xx-side*.25,yy,.376]],.024,5);
      }
      for(const k of [-1,1])s.rod('heartwood',[[x+side*.157,y+k*.35,.362],[x+side*.157,y+k*.87,.362],[x+side*.28,y+k*.87,.362],[x+side*.28,y+k*1.11,.362]],.023,5);
    }
    const outline=[];
    for(let k=0;k<=72;k++){
      const a=k*Math.PI/36,r=.259+.040*Math.cos(4*a);
      outline.push([x+r*Math.cos(a),y+r*1.34*Math.sin(a),.37]);}
    s.rod('heartwood',outline,.033,8);
  }
  s.section('EaveAndBracket');
  s.box('heartwood',0,3.31,0,4.64,.27,.76);
  roof(s,{w:5.02,d:1.90,eave:3.68,rise:.46,ridge:3.68,lift:.22,tilePitch:.15});
  const root=s.finish();
  root.add(windowRadiance(T,0,1.88,.13,3.52,2.33));
  const light=new T.PointLight(0xffbd76,7.5,4.30,2);
  light.name='WarmPaperSpill';light.position.set(0,1.82,.19);root.add(light);
  return root;
}
