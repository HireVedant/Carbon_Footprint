const fs = require('fs');
const geo = JSON.parse(fs.readFileSync('public/data/india_raw.geojson', 'utf8'));

// Ramer-Douglas-Peucker (non-recursive to avoid stack overflow)
function rdp(points, epsilon) {
  const keep = new Array(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  
  const stack = [[0, points.length - 1]];
  
  while (stack.length > 0) {
    const [start, end] = stack.pop();
    let maxDist = 0, maxIdx = start;
    const sx = points[start][0], sy = points[start][1];
    const ex = points[end][0], ey = points[end][1];
    const dx = ex - sx, dy = ey - sy;
    const lenSq = dx * dx + dy * dy;
    
    for (let i = start + 1; i < end; i++) {
      const px = points[i][0], py = points[i][1];
      let dist;
      if (lenSq === 0) {
        dist = Math.sqrt((px - sx) ** 2 + (py - sy) ** 2);
      } else {
        const t = Math.max(0, Math.min(1, ((px - sx) * dx + (py - sy) * dy) / lenSq));
        const projX = sx + t * dx, projY = sy + t * dy;
        dist = Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
      }
      if (dist > maxDist) { maxDist = dist; maxIdx = i; }
    }
    
    if (maxDist > epsilon) {
      keep[maxIdx] = true;
      if (maxIdx - start > 1) stack.push([start, maxIdx]);
      if (end - maxIdx > 1) stack.push([maxIdx, end]);
    }
  }
  
  return points.filter((_, i) => keep[i]);
}

function simplifyRing(coords, epsilon) {
  if (coords.length <= 4) return coords;
  const simplified = rdp(coords, epsilon);
  // Ensure ring is closed
  if (simplified.length >= 4) {
    const first = simplified[0];
    const last = simplified[simplified.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      simplified.push([first[0], first[1]]);
    }
  }
  return simplified;
}

function simplifyGeometry(geom, epsilon) {
  if (geom.type === 'Polygon') {
    geom.coordinates = geom.coordinates.map(ring => simplifyRing(ring, epsilon));
  } else if (geom.type === 'MultiPolygon') {
    geom.coordinates = geom.coordinates.map(polygon => polygon.map(ring => simplifyRing(ring, epsilon)));
  }
  return geom;
}

// Name normalization
const nameMap = {
  'Orissa': 'Odisha',
  'Uttaranchal': 'Uttarakhand',
};

// Process features
const features = [];
const seen = new Map();

geo.features.forEach(f => {
  const rawName = f.properties.NAME_1 || f.properties.name || f.properties.ST_NM;
  const name = nameMap[rawName] || rawName;
  
  // Aggressive simplification: 0.05 degrees ≈ 5km
  simplifyGeometry(f.geometry, 0.05);
  
  // Also round coordinates to 2 decimal places
  function roundCoords(coords) {
    if (typeof coords[0] === 'number') {
      return [Math.round(coords[0] * 100) / 100, Math.round(coords[1] * 100) / 100];
    }
    return coords.map(roundCoords);
  }
  f.geometry.coordinates = roundCoords(f.geometry.coordinates);
  
  if (seen.has(name)) {
    const existing = seen.get(name);
    if (existing.geometry.type === 'MultiPolygon' && f.geometry.type === 'MultiPolygon') {
      existing.geometry.coordinates = existing.geometry.coordinates.concat(f.geometry.coordinates);
    }
  } else {
    f.properties = { name };
    seen.set(name, f);
    features.push(f);
  }
});

geo.features = features;
const result = JSON.stringify(geo);
fs.writeFileSync('public/data/india_states.geojson', result);
console.log('Size:', (result.length / 1024).toFixed(0), 'KB');
console.log('States:', features.length);
console.log('Names:', features.map(f => f.properties.name).sort().join(', '));