// Procedural palace roofs in metres. Ring parameter t increases from ridge to eave.
// Each slope shares its hip boundaries with its neighbours. Tile rolls are clipped
// to those hips in plan so the central field retains parallel lines of tile.
export function buildRoofs(T, group, m) {
  const V = (x, y, z) => new T.Vector3(x, y, z);
  const mix = (a, b, t) => a + (b - a) * t;
  const sat = value => Math.max(0, Math.min(1, value));
  const smooth = x => { x = sat(x); return x * x * (3 - 2 * x); };
  const levels = [
    { name: 'Lower', x: 25, z: 15, topX: 17.15, topZ: 7.15, topY: 18.0, eaveY: 14.7, kick: 2.85, tilePitch: .31, breakT: 0 },
    { name: 'Upper', x: 20, z: 9.8, topX: 11.7, topZ: 0, topY: 26.5, eaveY: 20.4, kick: 2.65, tilePitch: .305, breakT: .47 },
  ];

  for (const roof of levels) {
    const upper = roof.name === 'Upper';
    const node = new T.Group();
    node.name = 'Roof_' + roof.name;
    group.add(node);
    const batches = new Map();
    function batch(label, material) {
      if (!batches.has(label)) batches.set(label, { material, position: [], uv: [], index: [] });
      return batches.get(label);
    }
    function vertex(b, p, u = p.x, v = p.z) {
      const i = b.position.length / 3;
      b.position.push(p.x, p.y, p.z);
      b.uv.push(u, v);
      return i;
    }
    function face(b, a, c, d, flip = false) {
      if (flip) b.index.push(a, d, c);
      else b.index.push(a, c, d);
    }
    function grid(b, nu, nv, point, flip) {
      const start = b.position.length / 3;
      for (let j = 0; j <= nv; ++j) {
        for (let i = 0; i <= nu; ++i) {
          const p = point(i / nu, j / nv);
          vertex(b, p, i / nu, j / nv);
        }
      }
      for (let j = 0; j < nv; ++j) {
        for (let i = 0; i < nu; ++i) {
          const a = start + j * (nu + 1) + i;
          face(b, a, a + 1, a + nu + 2, flip);
          face(b, a, a + nu + 2, a + nu + 1, flip);
        }
      }
    }
    // Solid swept rods share a deterministic, twist-free local frame. End caps appear
    // at the eave and on timber ends that can be seen from the front steps.
    function rod(b, points, radius, depth = radius, sides = 6) {
      if (points.length < 2) return;
      const rings = [], initial = points[1].clone().sub(points[0]).normalize();
      const guide = Math.abs(initial.y) > .93 ? V(0, 0, 1) : V(0, 1, 0);
      let ax = initial.clone().cross(guide).normalize();
      for (let j = 0; j < points.length; ++j) {
        const axis = points[Math.min(j + 1, points.length - 1)].clone()
          .sub(points[Math.max(0, j - 1)]).normalize();
        ax = ax.clone().addScaledVector(axis, -ax.dot(axis)).normalize();
        const ay = axis.clone().cross(ax).normalize();
        const ring = [];
        const t = j / (points.length - 1);
        for (let i = 0; i < sides; ++i) {
          const a = i * 2 * Math.PI / sides + Math.PI / sides;
          const rx = typeof radius === 'function' ? radius(t) : radius;
          const ry = typeof depth === 'function' ? depth(t) : depth;
          ring.push(vertex(b, points[j].clone()
            .addScaledVector(ax, rx * Math.cos(a)).addScaledVector(ay, ry * Math.sin(a)), i / sides, t));
        }
        rings.push(ring);
      }
      for (let j = 1; j < rings.length; ++j) {
        for (let i = 0; i < sides; ++i) {
          const k = (i + 1) % sides, a = rings[j - 1], c = rings[j];
          face(b, a[i], a[k], c[k]);
          face(b, a[i], c[k], c[i]);
        }
      }
      for (const end of [0, rings.length - 1]) {
        const ring = rings[end];
        const center = vertex(b, points[end]);
        for (let i = 0; i < sides; ++i) {
          face(b, center, ring[i], ring[(i + 1) % sides], end === 0);
        }
      }
    }
    const points = (count, fn) => Array.from({ length: count + 1 }, (_, i) => fn(i / count));
    const lifted = (p, amount) => { p.y += amount; return p; };
    const clay = batch('Tile_Field', m.tile);
    const rolls = [batch('Rolled_Tiles', m.tileLight), batch('Rolled_Tiles_Shadow', m.tile)];
    const edgeClay = batch('Glazed_Drip_Edge', m.tileDark);
    const gold = batch('Bronze_Ridge_Trim', m.gold);
    const lumber = batch('Timber_Soffit', m.wood);
    const carved = batch('Flying_Rafters', m.red);
    const faces = [
      { dir: 1, front: true }, { dir: -1, front: true },
      { dir: 1, front: false }, { dir: -1, front: false },
    ];
    // The gable roof retains a short, straight ridge over the upper gable.
    // The four corners expand faster near the eave to form a continuous hip sweep.
    function extent(t, front) {
      if (front) {
        const f = upper && t < roof.breakT ? .16 * t / roof.breakT :
          upper ? .16 + .84 * Math.pow((t - roof.breakT) / (1 - roof.breakT), 1.22) :
          Math.pow(t, 1.07);
        return mix(roof.topX, roof.x, f);
      }
      return mix(roof.topZ, roof.z, t);
    }
    function point(f, u, t) {
      const c = Math.abs(u), xHalf = extent(t, true), zHalf = extent(t, false);
      const eaveCurve = Math.pow(c, 6.2);
      const ridgeKick = upper ? .65 * Math.pow(c, 7) : .20 * Math.pow(c, 5);
      const rise = (roof.topY - roof.eaveY) * Math.pow(1 - t, upper ? 1.70 : 1.55);
      const cornerY = roof.kick * eaveCurve * Math.pow(t, upper ? 2.15 : 1.9);
      let y = roof.eaveY + rise + cornerY + ridgeKick * (1 - t);
      let x, z;
      if (f.front) {
        x = u * xHalf;
        z = f.dir * (zHalf - .42 * (1 - eaveCurve) * Math.pow(t, 1.6));
        if (!upper && f.dir === 1) {
          // The entry's short forward sweep is part of the roof skin and its ribs.
          const porch = 1 - smooth((Math.abs(x) - 8.3) / 1.6);
          z += 1.0 * porch * Math.pow(t, 5);
          y += .12 * porch * Math.pow(t, 6);
        }
      } else {
        x = f.dir * (xHalf - .32 * (1 - eaveCurve) * Math.pow(t, 1.6));
        z = u * zHalf;
      }
      return V(x, y, z);
    }
    function crossing(f, coordinate, t0) {
      if (coordinate <= extent(t0, f.front)) return t0;
      let lo = t0, hi = 1;
      for (let i = 0; i < 17; ++i) {
        const mid = (lo + hi) / 2;
        if (extent(mid, f.front) < coordinate) lo = mid;
        else hi = mid;
      }
      return hi;
    }
    for (const f of faces) {
      const t0 = !f.front && upper ? roof.breakT : 0;
      const flip = f.front ? f.dir === 1 : f.dir === -1;
      const map = (u, v) => point(f, 2 * u - 1, mix(t0, 1, v));
      grid(clay, 48, 14, map, flip);
      grid(lumber, 32, 9, (u,v) => lifted(map(u,v), -.29), !flip);
      const eave = points(64, k => point(f, k * 2 - 1, 1));
      rod(edgeClay, eave.map(p => lifted(p.clone(), -.105)), .19, .19, 8);
      rod(gold, eave.map(p => lifted(p.clone(), .012)), .047, .050, 6);
      rod(lumber, eave.map(p => lifted(p.clone(), -.35)), .18, .17, 6);

      const edge = extent(1, f.front), rows = Math.floor(edge / roof.tilePitch);
      for (let i = -rows + 1; i < rows; ++i) {
        const coord = i * roof.tilePitch;
        const start = Math.min(1, crossing(f, Math.abs(coord) + .07, t0) + .001);
        if (1 - start < .009) continue;
        const onSlope = t => point(f, coord / Math.max(.001, extent(t, f.front)), t);
        const n = Math.max(3, Math.ceil((1 - start) * 9));
        const path = points(n, k => lifted(onSlope(mix(start, 1, k)), .026));
        // Glazed cover tiles round the raised seams. Closely spaced timber tails
        // peek out below each run without creating thousands of draw calls.
        rod(rolls[Math.abs(i * 17 + (f.front ? 1 : 3)) % 5 === 1 ? 1 : 0], path, .072, .064, 6);
        if (i % 2 === 0) {
          const end = onSlope(1), rStart = Math.max(start, .68);
          const timber = points(3, k => lifted(onSlope(mix(rStart, 1, k)), -.38));
          rod(carved, timber, .109, .117, 4);
          const tangent = path.at(-1).clone().sub(path.at(-2)).normalize();
          const lip = lifted(end, .018);
          rod(edgeClay, [lip, lip.clone().addScaledVector(tangent, .08)], .087, .088, 7);
        }
      }
      // A raised scribed edge gives each overlapping horizontal tile course a
      // shadow line. Kept low and the same glaze as the field.
      const courses = upper ? 12 : 10;
      for (let k = 1; k < courses; ++k) {
        const t = mix(t0, 1, k / courses);
        if (t < .04) continue;
        const overlap = points(36, a => lifted(point(f, a * 2 - 1, t), .012));
        rod(clay, overlap, .02, .016, 4);
      }
    }
    for (const sx of [-1,1]) {
      for (const sz of [-1,1]) {
        const f = { front: true, dir: sz };
        const tTop = upper ? roof.breakT : 0;
        const hip = points(25, k => point(f, sx, mix(tTop, 1, k)));
        rod(edgeClay, hip.map(p => lifted(p.clone(), .07)), .19, .17, 8);
        rod(gold, hip.map(p => lifted(p.clone(), .178)), .095, .095, 8);
        const tip = hip.at(-1);
        const tipPath = [
          V(tip.x - sx * .57, tip.y - .28, tip.z - sz * .48),
          V(tip.x - sx * .12, tip.y + .03, tip.z - sz * .10),
          V(tip.x + sx * .19, tip.y + .38, tip.z + sz * .12),
          V(tip.x + sx * .39, tip.y + .74, tip.z + sz * .25),
        ];
        rod(gold, tipPath, t => mix(.13, .038, t), t => mix(.13,.047,t), 8);
      }
      if (!upper) continue;
      // The upper roof's two triangular gables are timber-panelled. Paired
      // verge mouldings trace the true xieshan break down to the side skirt.
      const tBreak = roof.breakT;
      const yBase = point({ front: false, dir: sx }, 0, tBreak).y;
      const zBase = extent(tBreak, false), xBase = extent(tBreak, true);
      const pBase = p => V(sx * (xBase - .32*Math.pow(tBreak, 1.6) *
        (1 - Math.pow(Math.abs(p.z/zBase), 6.2)) - .09), yBase, p.z);
      for (const sz of [-1,1]) {
        const roofline = points(14, s => point({ front:true, dir:sz }, sx, s*tBreak));
        grid(lumber, 14, 1, (u,v) => {
          const a = point({front:true,dir:sz}, sx, u*tBreak);
          return a.clone().lerp(pBase(a), v);
        }, sx * sz < 0);
        rod(edgeClay, roofline, .157, .13, 8);
        rod(gold, roofline.map(p => lifted(p.clone(), .112)), .062, .065, 6);
        const panelEdge = roofline.map(p => {p=p.clone();p.x+=sx*.05;return lifted(p,-.22);});
        rod(carved, panelEdge, .079,.12,6);
      }
      const e = point({front:false,dir:sx},0,tBreak);
      const cross = points(18, k => {
        const p = point({front:false,dir:sx},2*k-1,tBreak);
        p.x += sx*.05;
        return lifted(p,.055);
      });
      rod(gold, cross, .065, .07, 6);
      // Shallow inlaid cloud scrolls sit in the gable tympanum.
      for (const sz of [-1,1]) {
        const scroll = [[.05,.23],[.33,.42],[.42,.70],[.30,.81],[.14,.71],
          [.16,.58],[.32,.52],[.63,.42],[.95,.56],[1.21,.48],[1.37,.33],[1.65,.33]];
        const gableX = sx * (xBase - .25);
        // Because the gable leans inward with height, follow that surface.
        const pos = (z,y) => {
          const upperT = (y - e.y) / Math.max(.001, roof.topY + .65 - e.y);
          return V(mix(gableX,sx*roof.topX,sat(upperT)) + sx*.15, y, z);
        };
        rod(gold, scroll.map(([z,h]) => pos(sz*z,e.y+h+.15)), .043,.048,6);
      }
    }
    if (upper) {
      const crest = points(40, t => lifted(point({front:true,dir:1}, 2*t-1, 0),.065));
      rod(edgeClay, crest, .24, .19, 8);
      rod(gold, crest.map(p => lifted(p.clone(),.12)), .122,.127,8);
      for (const sx of [-1,1]) {
        const end = crest[sx > 0 ? crest.length-1 : 0];
        const crestTip = [[-.38,.04],[-.06,.12],[.12,.31],[.15,.57],[.12,.79],[.04,.94],[-.09,.96]];
        rod(gold, crestTip.map(([x,y])=>V(end.x+sx*x,end.y+y,end.z)),
          t=>mix(.21,.072,t), t=>mix(.22,.075,t), 8);
      }
    }
    for (const [name, b] of batches) {
      if (b.index.length === 0) continue;
      const geometry = new T.BufferGeometry();
      geometry.setAttribute('position',new T.Float32BufferAttribute(b.position,3));
      geometry.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));
      geometry.setIndex(b.index);
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
      const mesh = new T.Mesh(geometry, b.material);
      mesh.name = roof.name + '_' + name;
      mesh.castShadow = mesh.receiveShadow = true;
      node.add(mesh);
    }
  }
}
