// Coordinates are metres. Front elevation faces +Z, and local facade depth points out.
export function buildTimber(T, group, m) {
  const batches = new Map();
  const cube = new T.BoxGeometry(1, 1, 1);
  const peg = new T.CylinderGeometry(1, 1, 1, 12);
  const tempVertex = new T.Vector3();
  const tempNormal = new T.Vector3();
  const normalMatrix = new T.Matrix3();
  const matrix = new T.Matrix4();
  const position = new T.Vector3();
  const scale = new T.Vector3();
  const rotation = new T.Quaternion();
  const euler = new T.Euler();
  let facade = new T.Matrix4();
  let assembly = 'Hall';

  // Batch each assembly by material. All repetitions use ordinary indexed meshes in GLB.
  function draw(geometry, material, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) {
    const key = assembly + '_' + material;
    let batch = batches.get(key);
    if (!batch) {
      batch = { material, positions: [], normals: [], uvs: [], indices: [] };
      batches.set(key, batch);
    }
    rotation.setFromEuler(euler.set(rx, ry, rz));
    matrix.compose(position.set(x, y, z), rotation, scale.set(sx, sy, sz)).premultiply(facade);
    normalMatrix.getNormalMatrix(matrix);
    const attr = geometry.attributes;
    const base = batch.positions.length / 3;
    for (let i = 0; i < attr.position.count; i++) {
      tempVertex.fromBufferAttribute(attr.position, i).applyMatrix4(matrix);
      tempNormal.fromBufferAttribute(attr.normal, i).applyNormalMatrix(normalMatrix);
      batch.positions.push(tempVertex.x, tempVertex.y, tempVertex.z);
      batch.normals.push(tempNormal.x, tempNormal.y, tempNormal.z);
      batch.uvs.push(attr.uv.getX(i), attr.uv.getY(i));
    }
    if (geometry.index) {
      for (const idx of geometry.index.array) batch.indices.push(base + idx);
    } else {
      for (let i = 0; i < attr.position.count; i++) batch.indices.push(base + i);
    }
  }

  const box = (mat, x, y, z, w, h, d) => draw(cube, mat, x, y, z, w, h, d);
  const spindle = new T.CylinderGeometry(0.87, 1, 1, 24);
  const round = new T.CylinderGeometry(1, 1, 1, 32);
  const bulge = new T.LatheGeometry([
    new T.Vector2(0.82, -0.5), new T.Vector2(0.95, -0.37),
    new T.Vector2(1, -0.15), new T.Vector2(1, 0.07),
    new T.Vector2(0.96, 0.32), new T.Vector2(0.84, 0.5)
  ], 24);
  const disk = new T.CylinderGeometry(1, 1, 1, 64);
  const torus = new T.TorusGeometry(1, 0.032, 6, 72);
  function ring(mat, x, y, z, radius) {
    draw(torus, mat, x, y, z, radius, radius, radius);
  }

  function scroll(mat, x, y, z, points, radius) {
    const path = new T.CatmullRomCurve3(points.map(([u, v]) => new T.Vector3(x + u, y + v, z)));
    const wire = new T.TubeGeometry(path, Math.max(10, points.length * 3), radius, 5, false);
    draw(wire, mat, 0, 0, 0);
    wire.dispose();
  }

  function post(x, z) {
    box('stone', x, 6.09, z, 1.68, 0.18, 1.68);
    draw(round, 'stoneDark', x, 6.23, z, 0.79, 0.11, 0.79);
    draw(bulge, 'stoneLight', x, 6.56, z, 0.79, 0.6, 0.79);
    draw(round, 'stone', x, 6.89, z, 0.70, 0.12, 0.70);
    draw(spindle, 'red', x, 9.84, z, 0.65, 5.83, 0.65);
    draw(round, 'wood', x, 12.62, z, 0.64, 0.23, 0.64);
    draw(round, 'gold', x, 12.51, z, 0.635, 0.07, 0.635);
    draw(round, 'wood', x, 6.975, z, 0.66, 0.085, 0.66);
  }

  // A gong bracket: upturned bearing ends joined by a deep, curved, load-bearing belly.
  const gongShape = new T.Shape();
  gongShape.moveTo(-1, 0.45);
  gongShape.lineTo(-1, 0.89);
  gongShape.lineTo(-0.73, 0.89);
  gongShape.lineTo(-0.68, 0.62);
  gongShape.quadraticCurveTo(-0.49, 0.33, -0.25, 0.32);
  gongShape.lineTo(0.25, 0.32);
  gongShape.quadraticCurveTo(0.49, 0.33, 0.68, 0.62);
  gongShape.lineTo(0.73, 0.89);
  gongShape.lineTo(1, 0.89);
  gongShape.lineTo(1, 0.45);
  gongShape.lineTo(0.79, 0.44);
  gongShape.quadraticCurveTo(0.57, 0.015, 0.29, 0);
  gongShape.lineTo(-0.29, 0);
  gongShape.quadraticCurveTo(-0.57, 0.015, -0.79, 0.44);
  gongShape.closePath();
  const gong = new T.ExtrudeGeometry(gongShape, { depth: 1, bevelEnabled: false, curveSegments: 4 });
  gong.translate(0, 0, -0.5);
  function bracket(x, y, z, size = 1) {
    box('wood', x, y + 0.09 * size, z, 0.94 * size, 0.22 * size, 0.91 * size);
    draw(gong, 'red', x, y + 0.20 * size, z, 1.04 * size, 0.61 * size, 0.47 * size);
    draw(gong, 'wood', x, y + 0.27 * size, z + 0.07 * size, 1.10 * size, 0.59 * size, 0.40 * size, 0, Math.PI / 2);
    for (const sign of [-1, 1]) {
      box('wood', x + sign * 0.88 * size, y + 0.78 * size, z, 0.42 * size, 0.24 * size, 0.52 * size);
      box('tileDark', x, y + 0.79 * size, z + sign * 0.90 * size, 0.45 * size, 0.19 * size, 0.46 * size);
    }
    draw(gong, 'wood', x, y + 0.87 * size, z + 0.26 * size, 1.48 * size, 0.55 * size, 0.41 * size);
    box('red', x, y + 1.37 * size, z + 0.30 * size, 2.83 * size, 0.16 * size, 0.47 * size);
  }

  function frame(mat, x, y, z, w, h, t, depth) {
    box(mat, x, y + (h - t) / 2, z, w, t, depth);
    box(mat, x, y - (h - t) / 2, z, w, t, depth);
    for (const side of [-1, 1]) box(mat, x + side * (w - t) / 2, y, z, t, h - 2 * t, depth);
  }
  function windowPanel(x, y, z, w, h, lit, miniature = false) {
    box(lit ? 'paper' : 'panel', x, y, z, w, h, 0.12);
    const t = miniature ? 0.073 : 0.105;
    frame('wood', x, y, z + 0.08, w + 0.15, h + 0.15, t * 1.5, 0.17);
    frame('red', x, y, z + 0.135, w - 0.12, h - 0.11, 0.055, 0.08);
    const barsX = miniature ? 5 : 7;
    for (let i = 1; i < barsX; i++) {
      box('wood', x + w * (i / barsX - 0.5), y, z + 0.12, t * 0.54, h - 0.15, t);
    }
    const fractions = miniature ? [0.22, 0.62, 0.75] : [0.14, 0.24, 0.67, 0.79, 0.88];
    for (const f of fractions) box('wood', x, y + h * (f - 0.5), z + 0.13, w - 0.10, t * 0.62, t);
    if (!miniature) {
      for (const side of [-1, 1]) {
        frame('wood', x + side * w * 0.213, y + h * 0.035, z + 0.146,
          w * 0.29, h * 0.21, 0.044, 0.07);
      }
    }
  }

  function door(x, z, w) {
    const h = 5.95;
    const y = 6.22 + h / 2;
    box('panel', x, y, z, w, h, 0.26);
    for (const side of [-1, 1]) {
      const leaf = x + side * w * 0.25;
      box('wood', leaf, y, z + 0.13, w * 0.488, h - 0.18, 0.15);
      frame('red', leaf, y, z + 0.21, w * 0.457, h - 0.38, 0.14, 0.09);
      frame('gold', leaf, y, z + 0.272, w * 0.421, h - 0.65, 0.035, 0.042);
      for (const yy of [y - 2.45, y + 2.42]) {
        box('gold', leaf + side * w * 0.18, yy, z + 0.28, 0.25, 0.10, 0.045);
      }
    }
    const medY = 9.29;
    draw(disk, 'gold', x, medY, z + 0.295, 1.78, 0.14, 1.78, Math.PI / 2);
    draw(disk, 'wood', x, medY, z + 0.385, 1.61, 0.055, 1.61, Math.PI / 2);
    ring('gold', x, medY, z + 0.434, 1.55);
    ring('gold', x, medY, z + 0.44, 1.36);
    const motif = [[0, -1.20], [0.02, -0.83], [0.27, -0.65], [0.54, -0.43], [0.60, -0.10],
      [0.43, 0.05], [0.29, -0.06], [0.33, -0.22], [0.44, -0.24]];
    for (let i = 0; i < 8; i++) {
      const a = Math.PI * i / 4;
      const rotated = motif.map(([u, v]) => [u * Math.cos(a) - v * Math.sin(a), u * Math.sin(a) + v * Math.cos(a)]);
      scroll('gold', x, medY, z + 0.45, rotated, 0.035);
    }
    for (let i = 0; i < 16; i++) {
      const a = 2 * Math.PI * i / 16;
      draw(peg, 'gold', x + 1.46 * Math.sin(a), medY + 1.46 * Math.cos(a), z + 0.445,
        0.05, 0.065, 0.05, Math.PI / 2);
    }
    // The ornamental plate splits on the two door leaves, with independent drop handles.
    box('panel', x, y, z + 0.49, 0.037, h - 0.20, 0.022);
    for (const side of [-1, 1]) {
      draw(disk, 'gold', x + side * 0.26, medY - 0.33, z + 0.52, 0.11, 0.10, 0.11, Math.PI / 2);
      ring('gold', x + side * 0.26, medY - 0.47, z + 0.61, 0.15);
    }
    frame('wood', x, y, z + 0.12, w + 0.35, h + 0.13, 0.19, 0.4);
    box('gold', x, y + h / 2 + 0.11, z + 0.24, w + 0.43, 0.055, 0.11);
  }

  function lintelBay(x, z, width, principal) {
    const y = principal ? 13.40 : 13.24;
    const w = principal ? width * 0.84 : width * 0.71;
    const h = principal ? 1.03 : 0.67;
    box('wood', x, y, z, w + 0.19, h + 0.13, 0.21);
    box('tileDark', x, y, z + 0.13, w, h, 0.10);
    frame('gold', x, y, z + 0.205, w - 0.10, h - 0.08, 0.033, 0.07);
    const radius = h * 0.26;
    draw(disk, 'gold', x, y, z + 0.23, radius, 0.08, radius, Math.PI / 2);
    const lateral = w * 0.41;
    for (const side of [-1, 1]) {
      const cloud = [[0.13, 0], [0.23, 0.13], [0.33, 0.06], [0.43, -0.11], [0.58, -0.09],
        [0.72, 0.10], [0.88, 0.09], [1, 0]].map(([u, v]) => [side * u * lateral, v * h]);
      scroll('gold', x, y, z + 0.25, cloud, principal ? 0.044 : 0.031);
    }
  }

  function facadeAt(angle, offset, name) {
    facade.makeRotationY(angle);
    facade.setPosition(Math.sin(angle) * offset, 0, Math.cos(angle) * offset);
    assembly = name;
  }

  const xs = [-21, -15.3, -9.6, -3.9, 3.9, 9.6, 15.3, 21];
  const zs = [-11.8, -5.9, 0, 5.9, 11.8];
  // Close and shade the inside of the portico. These surfaces remain visible when looking up.
  box('wood', 0, 13.97, 0, 43.25, 0.23, 25.8);
  box('panel', 0, 9.98, 0, 39.0, 7.62, 18.0);
  for (let i = 0; i < 4; i++) {
    const long = i % 2 === 0;
    const front = i === 0;
    const points = long ? xs : zs;
    const outer = long ? 11.8 : 21;
    facadeAt(i * Math.PI / 2, outer, ['FrontPortico', 'EastPortico', 'NorthPortico', 'WestPortico'][i]);
    for (let j = 0; j < points.length; j++) {
      const x = points[j];
      if (long || (j > 0 && j < points.length - 1)) {
        post(x, 0);
        bracket(x, 12.72, 0);
      }
    }
    const span = points.at(-1) - points[0];
    box('wood', 0, 14.12, 0.28, span + 1.65, 0.48, 0.78);
    box('red', 0, 13.87, 0.27, span + 1.12, 0.09, 0.80);
    for (let j = 0; j < points.length - 1; j++) {
      const mid = (points[j] + points[j + 1]) / 2;
      const w = points[j + 1] - points[j];
      box('wood', mid, 13.02, 0, w - 0.24, 0.65, 0.54);
      const isEntry = long && j === 3;
      lintelBay(mid, 0.34, w, isEntry && front);
      bracket(mid, 13.43, 0.28, 0.53);
      // The facade is set behind the column line. On the shorter elevations the two end bays
      // turn into open aisles in front of the recessed return wall.
      const inset = long ? 2.80 : 1.50;
      const wallZ = -inset;
      let openingWidth = w - 0.32;
      let screenX = mid;
      if (!long && (j === 0 || j === points.length - 2)) {
        const sign = Math.sign(mid);
        const inner = j === 0 ? points[j + 1] : points[j];
        screenX = (inner + sign * 9) / 2;
        openingWidth = 2 * Math.abs(screenX - inner) - 0.12;
      } else if (long && (j === 0 || j === points.length - 2)) {
        const sign = Math.sign(mid);
        const inner = j === 0 ? points[j + 1] : points[j];
        screenX = (inner + sign * 19.5) / 2;
        openingWidth = 2 * Math.abs(screenX - inner) - 0.12;
      }
      const reveal = wallZ + 0.12;
      box('wood', screenX, 6.43, reveal, openingWidth, 0.45, 0.24);
      box('wood', screenX, 12.43, reveal, openingWidth, 0.34, 0.30);
      if (isEntry && front) {
        door(screenX, reveal + 0.11, 5.98);
      } else {
        const leafW = (openingWidth - 0.45) / 2;
        for (const side of [-1, 1]) {
          const xx = screenX + side * (leafW / 2 + 0.065);
          box('wood', xx, 7.27, reveal, leafW, 1.40, 0.18);
          frame('red', xx, 7.27, reveal + 0.13, leafW - 0.18, 1.10, 0.08, 0.09);
          windowPanel(xx, 9.98, reveal + 0.08, leafW - 0.19, 3.63, j % 3 !== 0 || front);
        }
      }
    }
  }

  facade.identity();
  assembly = 'Clerestory';
  box('panel', 0, 18.99, 0, 33.8, 2.70, 13.8);
  for (let i = 0; i < 4; i++) {
    const long = i % 2 === 0;
    facadeAt(i * Math.PI / 2, long ? 7 : 17, 'Clerestory');
    const span = long ? 34 : 14;
    const bays = long ? 9 : 4;
    const w = span / bays;
    box('wood', 0, 17.82, 0, span + 0.31, 0.24, 0.38);
    box('red', 0, 18.05, 0.04, span + 0.31, 0.13, 0.38);
    box('wood', 0, 20.06, 0.07, span + 0.43, 0.34, 0.47);
    for (let j = 0; j <= bays; j++) {
      const x = -span / 2 + j * w;
      if (long || (j > 0 && j < bays)) {
        draw(spindle, 'red', x, 19.00, 0.06, 0.25, 2.11, 0.25);
        bracket(x, 19.47, 0.02, 0.49);
      }
      if (j === bays) continue;
      const mid = x + w / 2;
      for (const side of [-1, 1]) windowPanel(mid + side * w * 0.205, 18.95, 0.01, w * 0.39, 1.37, true, true);
    }
  }

  for (const [name, b] of batches) {
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.Float32BufferAttribute(b.positions, 3));
    geometry.setAttribute('normal', new T.Float32BufferAttribute(b.normals, 3));
    geometry.setAttribute('uv', new T.Float32BufferAttribute(b.uvs, 2));
    geometry.setIndex(b.indices);
    const mesh = new T.Mesh(geometry, m[b.material]);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  for (const primitive of [cube, peg, spindle, round, bulge, disk, torus, gong]) primitive.dispose();
}
