import {rockStudio, mass} from '../../ThreeJS共享/terrain-rock.mjs';

export function buildAsset(T) {
  const rock = rockStudio(T,716,{tone:'blue',grain:1.9});
  // The rear is a planar joining face. Projecting beds and faults face +Z.
  const widths=[-7.8,-6.45,-5.3,-4.1,-2.9,-1.75,-.65,.45,1.7,2.9,4.25,5.5,6.8,7.8];
  const levels=[0,.9,2.5,3.0,4.65,6.2,7.25],rows=[];
  for(let j=0;j<levels.length;j++){
    const row=widths.map((x,i)=>{
      const end=i===0||i===widths.length-1;
      const fault=.46*Math.sin(i*1.91)+.23*Math.sin(i*4.17);
      const ledge=j===2||j===5?.73:0;
      return [x+(end?0:.23*Math.sin(i*1.2+j*.43)),levels[j]+.18*Math.sin(i*1.4+j*.5),1.8+fault+ledge+.18*Math.cos(j*1.5+i*.42)];
    });
    rows.push(row);
  }
  for(let j=0;j<rows.length-1;j++)for(let i=0;i<widths.length-1;i++){
    const a=rows[j][i],b=rows[j][i+1],c=rows[j+1][i+1],d=rows[j+1][i],v=.52+.24*Math.sin(i*2.9);
    rock.facet(a,b,c,v,j===2||j===5?.23:0);rock.facet(a,c,d,v*.78);
  }
  const back=(p)=>[p[0],p[1],-1.6];
  const quad=(a,b,c,d)=>{rock.facet(a,b,c,.52,.1);rock.facet(a,c,d,.48,.1);};
  for(let i=0;i<widths.length-1;i++){
    const a=rows[0][i],b=rows[0][i+1],c=rows.at(-1)[i+1],d=rows.at(-1)[i];
    quad(d,c,back(c),back(d));quad(b,a,back(a),back(b));quad(back(b),back(a),back(d),back(c));
  }
  for(let j=0;j<rows.length-1;j++){
    const a=rows[j][0],b=rows[j+1][0],c=rows[j].at(-1),d=rows[j+1].at(-1);
    quad(a,b,back(b),back(a));quad(d,c,back(c),back(d));
  }
  return rock.finish('F15');
}

export const presentation = {studioLightScale:.83,background:0xcad3d5,floorColor:0x8d9794, direction:[.44,.53,1.5]};
