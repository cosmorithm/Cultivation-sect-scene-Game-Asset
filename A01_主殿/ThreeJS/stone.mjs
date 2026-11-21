// A01 stonework. Metres, ground at Y=0, approach from +Z.
export function buildStone(T, group, m) {
  const base = new T.Group();
  base.name = 'Stonework';
  group.add(base);

  const batches = new Map();
  const identity = new T.Quaternion();
  const transform = new T.Matrix4();
  const normalTransform = new T.Matrix3();
  const point = new T.Vector3();
  const normal = new T.Vector3();
  const boxGeo = new T.BoxGeometry(1, 1, 1);
  const up = new T.Vector3(0, 1, 0);
  const rotation = angle => new T.Quaternion().setFromAxisAngle(up, angle);
  let family = 'Terraces';

  function add(geo, material, x, y, z, sx = 1, sy = 1, sz = 1, q = identity) {
    const key = family + '/' + material;
    if (!batches.has(key)) {
      batches.set(key, { material, positions: [], normals: [], uv: [], index: [] });
    }
    const batch = batches.get(key);
    const offset = batch.positions.length / 3;
    transform.compose(new T.Vector3(x, y, z), q, new T.Vector3(sx, sy, sz));
    normalTransform.getNormalMatrix(transform);
    const pos = geo.getAttribute('position');
    const norm = geo.getAttribute('normal');
    for (let i = 0; i < pos.count; i++) {
      point.fromBufferAttribute(pos, i).applyMatrix4(transform);
      normal.fromBufferAttribute(norm, i).applyNormalMatrix(normalTransform);
      batch.positions.push(point.x, point.y, point.z);
      batch.normals.push(normal.x, normal.y, normal.z);
      // Planar stone projection in metres also keeps grain continuous across cornices.
      const vertical = Math.abs(normal.y) > 0.68;
      const side = Math.abs(normal.x) > Math.abs(normal.z);
      batch.uv.push((vertical || !side ? point.x : point.z) / 3, (vertical ? point.z : point.y) / 3);
    }
    const index = geo.getIndex();
    if (index) {
      for (let i = 0; i < index.count; i++) batch.index.push(offset + index.getX(i));
    } else {
      for (let i = 0; i < pos.count; i++) batch.index.push(offset + i);
    }
  }

  function box(material, x, bottom, z, width, height, depth, q = identity) {
    add(boxGeo, material, x, bottom + height / 2, z, width, height, depth, q);
  }

  // Continuous recessed wall field between projecting carved plinth and cap.
  const tiers = [
    { w: 53.4, d: 34.6, y: 0 },
    { w: 50.2, d: 31.2, y: 2 },
    { w: 46.9, d: 28.2, y: 4 }
  ];
  const moulding = [
    // Height above tier base, course height, horizontal overhang and stone tone.
    [0, .16, .27, 'stone'], [.16, .13, .21, 'stoneLight'],
    [.29, .10, .11, 'stone'], [.39, 1.21, 0, 'stone'],
    [1.60, .075, .06, 'stoneDark'], [1.675, .09, .135, 'stone'],
    [1.765, .16, .23, 'stoneLight'], [1.925, .075, .20, 'stone']
  ];
  for (const {w, d, y} of tiers) {
    for (const [rise, height, overhang, mat] of moulding) {
      box(mat, 0, y + rise, 0, w + 2 * overhang, height, d + 2 * overhang);
    }
  }

  // Each point lists distance above the terrace and radius of the lotus-bud finial.
  const budGeo = new T.LatheGeometry([
    [0, 0], [.095, 0], [.125, .035], [.105, .072], [.073, .087],
    [.115, .136], [.105, .205], [.065, .266], [.026, .30], [0, .32]
  ].map(([r, h]) => new T.Vector2(r, h)), 8);

  function post(x, y, z) {
    box('stoneLight', x, y, z, .43, .12, .43);
    box('stone', x, y + .12, z, .30, .66, .30);
    box('stoneLight', x, y + .78, z, .365, .085, .365);
    add(budGeo, 'stone', x, y + .865, z);
  }

  function balustrade(x1, z1, x2, z2, y, startPost = true, endPost = true) {
    const dx = x2 - x1, dz = z2 - z1;
    const length = Math.hypot(dx, dz);
    const spans = Math.max(1, Math.round(length / 2.75));
    const span = length / spans;
    const q = rotation(Math.atan2(-dz, dx));
    for (let i = startPost ? 0 : 1; i <= (endPost ? spans : spans - 1); i++) {
      post(x1 + dx * i / spans, y, z1 + dz * i / spans);
    }
    for (let i = 0; i < spans; i++) {
      const t = (i + .5) / spans, x = x1 + dx*t, z = z1 + dz*t;
      box('stone', x, y + .225, z, span - .20, .095, .115, q);
      box('stoneLight', x, y + .625, z, span - .20, .13, .16, q);
      // The slender central strut repeats the low parapet motif of the master sheet.
      box('stone', x, y + .32, z, .095, .31, .09, q);
    }
  }

  function framedSide(nx, nz, dist, along, height, outset) {
    return [nx * (dist + outset) + nz * along, height, nz * (dist + outset) - nx * along];
  }

  // Shallow cloud-scroll relief on the exposed granite drum. Geometry of this
  // mirrored pattern is shared across panels before the final material batches.
  const V = (x, y) => new T.Vector3(x, y, 0);
  const relief = [];
  function line(vertices, radius, samples = 16) {
    const curve = new T.CatmullRomCurve3(vertices);
    // Only the front of the low chisel ridge is visible above the backing slab.
    const vertices3d = [], indices = [];
    for (let i=0; i<=samples; i++) {
      const point=curve.getPoint(i/samples), tangent=curve.getTangent(i/samples);
      const nx=-tangent.y*radius, ny=tangent.x*radius;
      vertices3d.push(point.x-nx,point.y-ny,0, point.x,point.y,radius*.85,
        point.x+nx,point.y+ny,0);
      if (i<samples) {
        const a=3*i;
        indices.push(a,a+3,a+1, a+1,a+3,a+4, a+1,a+4,a+2, a+2,a+4,a+5);
      }
    }
    const g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(vertices3d,3));
    g.setIndex(indices);
    g.computeVertexNormals();
    relief.push(g);
  }
  for (const hand of [-1, 1]) {
    const cloud = [[.20, -.06], [.36, .10], [.56, .14], [.71, .06], [.89, .055],
      [1.09, .12], [1.05, .20], [.93, .18], [.93, .105]];
    const under = [[.22, -.09], [.43, -.02], [.61, -.14], [.91, -.115],
      [1.15, -.045], [1.39, -.06], [1.52, 0]];
    line(cloud.map(([x,y]) => V(hand*x, y)), .032, 16);
    line(under.map(([x,y]) => V(hand*x, y)), .033, 12);
  }
  const ring = new T.TorusGeometry(.185, .036, 4, 12);
  const core = new T.SphereGeometry(.10, 8, 4);
  function reliefSpans(nx, nz, dist, from, to, tierY) {
    const n = Math.max(1, Math.round((to - from) / 4.6));
    const w = (to - from)/n;
    const q = rotation(Math.atan2(nx, nz));
    function faceBox(mat, t, y, protrusion, a, b, c) {
      const [x, cy, z] = framedSide(nx, nz, dist, t, y, protrusion);
      add(boxGeo, mat, x, cy, z, a, b, c, q);
    }
    for (let i = 0; i<n; i++) {
      const mid = from + (i + .5)*w;
      const centreY = tierY + 1.0;
      const width = w - .24;
      faceBox('stoneLight', mid - width/2, centreY, .03, .10, 1.12, .07);
      faceBox('stoneLight', mid + width/2, centreY, .03, .10, 1.12, .07);
      faceBox('stoneLight', mid, centreY + .53, .03, width, .06, .07);
      faceBox('stoneLight', mid, centreY - .53, .03, width, .06, .07);
      const [x,y,z] = framedSide(nx,nz,dist,mid,centreY,.045);
      const unit = Math.min(1.4, width/3.7);
      for (const g of relief) add(g, 'stoneLight', x,y,z,unit,1.25,1,q);
      add(ring,'stoneLight',x,y,z,unit,1.25,1,q);
      add(core,'stoneLight',x,y,z,unit,1.25,.45,q);
    }
  }

  for (let i = 0; i < tiers.length; i++) {
    const {w,d,y} = tiers[i];
    const halfW = w/2, halfD = d/2;
    const railW = halfW - .28, railD = halfD - .29;
    family = 'Balustrades';
    const opening = 7.76 - i * .29;
    balustrade(-railW, railD, -opening, railD, y + 2);
    balustrade(opening, railD, railW, railD, y + 2);
    balustrade(-railW, -railD, railW, -railD, y + 2);
    balustrade(-railW, -railD, -railW, railD, y + 2, false, false);
    balustrade(railW, -railD, railW, railD, y + 2, false, false);
    family = 'Reliefs';
    reliefSpans(0,1,halfD,-halfW,-opening,y);
    reliefSpans(0,1,halfD,opening,halfW,y);
    reliefSpans(0,-1,halfD,-halfW,halfW,y);
    reliefSpans(-1,0,halfW,-halfD,halfD,y);
    reliefSpans(1,0,halfW,-halfD,halfD,y);
  }

  family = 'Processional_stair';
  const tread = .385;
  const rise = 2/11;
  const landing = .91;
  const lastEdge = tiers[2].d/2 + .18;
  let frontEdge = lastEdge + 33*tread + 2*landing;
  const fromFront = new T.Vector3(0, 0, 1);

  // Solid trapezoidal cheeks rest on the terrace below. The visible handrail
  // is pitched along the steps, with each landing providing a short break.
  function cheek(x, near, far, low, high, side) {
    const width = .57, footY = Math.max(0, low-.32);
    const p = [
      [x-width/2,footY,near], [x+width/2,footY,near],
      [x+width/2,low+.39,near], [x-width/2,low+.39,near],
      [x-width/2,footY,far], [x+width/2,footY,far],
      [x+width/2,high+.39,far], [x-width/2,high+.39,far]
    ];
    const idx = [0,1,2,0,2,3, 5,4,7,5,7,6, 4,0,3,4,3,7,
      1,5,6,1,6,2, 3,2,6,3,6,7, 4,5,1,4,1,0];
    const g = new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(idx.flatMap(i=>p[i]),3));
    g.computeVertexNormals();
    add(g,'stone',0,0,0);
    const railDir = new T.Vector3(0, low-high, near-far);
    const q = new T.Quaternion().setFromUnitVectors(fromFront, railDir.clone().normalize());
    add(boxGeo, 'stoneLight', x,(low+high)/2+.41,(near+far)/2,
      width+.12,.15,railDir.length(),q);
    // Square newels at the foot of each flight carry an incised bronze-rimmed roundel.
    box('stoneLight',x,low,near-.10,.75,.15,.75);
    box('stone',x,low+.14,near-.10,.62,.39,.62);
    box('stoneLight',x,low+.53,near-.10,.68,.10,.68);
    add(ring,'stoneLight',x,low+.345,near+.22,.75,.75,1);
    const outer = x+side*.33;
    add(ring,'stoneLight',outer,low+.345,near-.10,.75,.75,1,rotation(side*Math.PI/2));
  }
  for (let flight=0; flight<3; flight++) {
    const width = 14.30 - flight*.56;
    const near = frontEdge;
    for (let step=0; step<11; step++) {
      const top = 2*flight+(step+1)*rise;
      // Full blocks support stair intersections and cast closed shadows underneath.
      box('stone',0,0,frontEdge-tread/2,width,top-.055,tread+.004);
      box('stoneLight',0,top-.055,frontEdge-tread/2+.012,width+.018,.055,tread+.024);
      frontEdge -= tread;
    }
    for (const side of [-1,1]) cheek(side*(width/2+.29),near,frontEdge,flight*2,(flight+1)*2,side);
    if (flight<2) {
      const nextWidth = width-.56;
      const level=(flight+1)*2;
      box('stone',0,0,frontEdge-landing/2,width+.58,level-.085,landing+.008);
      box('stoneLight',0,level-.085,frontEdge-landing/2,width+.60,.085,landing+.01);
      for (const side of [-1,1]) {
        box('stone',side*(nextWidth/2+.29),level,frontEdge-landing/2,.57,.36,landing);
        box('stoneLight',side*(nextWidth/2+.29),level+.36,frontEdge-landing/2,.64,.105,landing+.012);
      }
      frontEdge -= landing;
    }
  }
  for (const [key,batch] of batches) {
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(batch.positions,3));
    geo.setAttribute('normal', new T.Float32BufferAttribute(batch.normals,3));
    geo.setAttribute('uv', new T.Float32BufferAttribute(batch.uv,2));
    geo.setIndex(batch.index);
    geo.computeBoundingSphere();
    const mesh = new T.Mesh(geo,m[batch.material]);
    mesh.name = key.replace('/', '_');
    mesh.castShadow = mesh.receiveShadow = true;
    base.add(mesh);
  }
  return base;
}
