// Seamless, deterministic PBR textures. Pixel variation is in sRGB for colour
// and linear for roughness. All motifs on the doors and rails are real geometry.
export function makeMaterials(T) {
  const size = 256;
  function hash(x, y) {
    let h = Math.imul(x + 193, 374761393) + Math.imul(y + 97, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  function noise(u, v, nx, ny) {
    const x = u * nx, y = v * ny, ix = Math.floor(x), iy = Math.floor(y);
    const smooth = a => a * a * (3 - 2 * a);
    const fx = smooth(x - ix), fy = smooth(y - iy);
    const at = (dx,dy) => hash(((ix+dx)%nx+nx)%nx,((iy+dy)%ny+ny)%ny);
    return (at(0,0)*(1-fx)+at(1,0)*fx)*(1-fy) + (at(0,1)*(1-fx)+at(1,1)*fx)*fy;
  }
  function texture(pixels, name, color) {
    const t = new T.DataTexture(pixels, size, size);
    t.name = name;
    t.colorSpace = color ? T.SRGBColorSpace : T.NoColorSpace;
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.magFilter = T.LinearFilter;
    t.minFilter = T.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.needsUpdate = true;
    return t;
  }
  function surface(family) {
    const color = new Uint8Array(size*size*4), packed = color.slice();
    for(let y=0; y<size; y++) for(let x=0; x<size; x++) {
      const u=x/size,v=y/size;
      const broad=noise(u,v,4,4), fine=noise(u,v,42,42), grain=hash(x,y);
      let light, warmth, rough;
      if (family === 'timber') {
        const warp = 0.035*Math.sin(2*Math.PI*v) + .075*(noise(u,v,4,3)-.5);
        const fibre = noise(u+warp,v,94,5);
        const lateWood = Math.pow(.5+.5*Math.cos(2*Math.PI*(34*u + .9*Math.sin(2*Math.PI*v)+2.4*broad)),8);
        light=.86+.09*fibre+.045*broad-.075*lateWood+.035*grain;
        warmth=.018*(1-fibre); rough=.79+.16*fibre;
      } else if (family === 'granite') {
        const crystal = grain>.977 ? .12 : grain<.039 ? -.16 : 0;
        light=.84+.075*broad+.07*fine+.055*grain+crystal;
        warmth=.025*(broad-.3); rough=.85+.14*fine;
      } else if (family === 'glaze') {
        const run=noise(u,v,38,4);
        light=.86+.065*broad+.055*run+.028*fine;
        warmth=-.024*(1-run); rough=.73+.19*run+.06*grain;
      } else {
        light=.82+.11*broad+.055*fine+.025*grain;
        warmth=.022*(1-broad); rough=.67+.26*fine;
      }
      const i=4*(y*size+x);
      const byte=n=>Math.min(255,Math.max(0,Math.round(n*255)));
      color.set([byte(light+warmth),byte(light),byte(light-warmth),255],i);
      packed.set([255,byte(rough),255,255],i);
    }
    return {base:texture(color,family+'-albedo',true),orm:texture(packed,family+'-roughness',false)};
  }
  const maps = Object.fromEntries(['timber','granite','glaze','bronze'].map(k=>[k,surface(k)]));
  function mat(name,hex,roughness,metalness,family) {
    const p={name,color:hex,roughness,metalness};
    if (family) Object.assign(p,{map:maps[family].base,roughnessMap:maps[family].orm,metalnessMap:maps[family].orm});
    return new T.MeshStandardMaterial(p);
  }
  return {
    tile: mat('Roof • peacock slate',0x527e8e,.46,.08,'glaze'),
    tileLight: mat('Roof • glazed rounds',0x638b98,.37,.09,'glaze'),
    tileDark: mat('Roof • deep blue ceramic',0x3d6374,.51,.04,'glaze'),
    red: mat('Columns • aged cinnabar',0xa05f4e,.56,.015,'timber'),
    wood: mat('Joinery • smoked chestnut',0x825644,.68,.015,'timber'),
    panel: mat('Doors • dark walnut',0x583829,.57,.015,'timber'),
    stone: mat('Terrace • warm limestone',0xd1c7b7,.88,0,'granite'),
    stoneLight: mat('Stone • pale arrises',0xe0d6c7,.84,0,'granite'),
    stoneDark: mat('Stone • shaded carving',0xb5a99b,.92,0,'granite'),
    gold: mat('Inlay • aged bronze',0xc2a16c,.46,.72,'bronze'),
    paper: mat('Windows • amber silk',0xb29472,.94,0),
    plaster: mat('Wall • lime plaster',0xd0c2ac,.91,0,'granite')
  };
}
