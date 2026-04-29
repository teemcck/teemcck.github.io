// -+- Cellular Void Shader — Worley + Curl + Trig Lattice -+-

uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

// -- Simple Options --
float pixelSize    = 6.0;
float voidScale    = 4.0;
float voidSpeed    = 0.004;
float warpStrength = 0.055;
float shimmerStrength = 0.18;

// -- Color Palette --
vec3 color0 = vec3(0.05, 0.06, 0.10);
vec3 color1 = vec3(0.09, 0.11, 0.17);
vec3 color2 = vec3(0.14, 0.18, 0.26);
vec3 color3 = vec3(0.20, 0.26, 0.36);
vec3 glowColor = vec3(0.28, 0.45, 0.65);

// -------------------------------------------------------
// NOISE 1: Worley / Cellular Noise
// Instead of smooth value noise, cells form around random
// jittered points. F2-F1 gives crisp crystalline borders.
// -------------------------------------------------------
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

vec2 worley(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float F1 = 8.0, F2 = 8.0;
  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 nb = vec2(float(x), float(y));
      vec2 r  = nb + hash2(i + nb) - f;
      float d = dot(r, r);
      if (d < F1) { F2 = F1; F1 = d; }
      else if (d < F2) { F2 = d; }
    }
  }
  return vec2(sqrt(F1), sqrt(F2));
}

// Layered Worley FBM — produces faceted, mineral-like shapes
float worleyFbm(vec2 p) {
  float v = 0.0, amp = 0.55;
  for (int i = 0; i < 4; i++) {
    vec2 w = worley(p);
    v   += (w.y - w.x) * amp; // cell boundary thickness
    p   *= 2.1;
    p   += vec2(5.7, 3.3);
    amp *= 0.48;
  }
  return v;
}

// -------------------------------------------------------
// NOISE 2: Curl Noise (from a trig scalar potential)
// No hash required — divergence-free flow from sin/cos.
// Produces swirling, incompressible warp vectors.
// -------------------------------------------------------
float scalarPotential(vec2 p) {
  return sin(p.x * 1.7 + p.y * 0.9)
       + sin(p.x * 0.6 - p.y * 2.1) * 0.6
       + sin(p.x * 3.1 + p.y * 1.4) * 0.3;
}

vec2 curl(vec2 p) {
  const float eps = 0.01;
  float dx = (scalarPotential(p + vec2(eps, 0.0)) - scalarPotential(p - vec2(eps, 0.0))) / (2.0 * eps);
  float dy = (scalarPotential(p + vec2(0.0, eps)) - scalarPotential(p - vec2(0.0, eps))) / (2.0 * eps);
  return vec2(dy, -dx); // perpendicular gradient = curl
}

// -------------------------------------------------------
// NOISE 3: Domain-Repeated Trig Shimmer
// A standing-wave crystal lattice — fully periodic,
// no random hash, gives a very different shimmer character.
// -------------------------------------------------------
float trigShimmer(vec2 uv, float t) {
  float s = sin(uv.x * 11.0 + uv.y * 7.0  + t * 2.1)
           * cos(uv.x *  5.0 - uv.y * 13.0 + t * 1.3);
  return s * 0.5 + 0.5;
}

// -------------------------------------------------------
// WARP
// Two-pass curl — first curl warps input, second curl
// warps again using the displaced coords. Richer than
// straight domain warping.
// -------------------------------------------------------
vec2 warp(vec2 uv) {
  float t = uTime * voidSpeed;
  vec2 c1 = curl(uv * 2.5 + vec2(t * 8.0, 0.0));
  vec2 c2 = curl(uv * 4.0 - vec2(0.0, t * 12.0) + c1 * 1.4);
  return uv + c2 * warpStrength;
}

void main() {
  vec2 fragCoord = vUv * uResolution;
  vec2 uv = floor(fragCoord / pixelSize) * pixelSize / uResolution.xy;
  uv.x *= uResolution.x / uResolution.y;

  vec2 warpedUv = warp(uv);

  // Three Worley layers — coarse, medium, fine
  float large  = worleyFbm(warpedUv * voidScale);
  float medium = worleyFbm(warpedUv * voidScale * 2.3 + vec2(0.0, uTime * 0.006));
  float fine   = worleyFbm(warpedUv * voidScale * 5.5 - vec2(uTime * 0.003, 0.0));

  large  = smoothstep(0.10, 0.55, large);
  medium = smoothstep(0.15, 0.50, medium);
  fine   = smoothstep(0.20, 0.45, fine);

  float voidShape = large * 0.60 + medium * 0.40;
  voidShape *= 0.70 + fine * 0.50;

  // Crystal-lattice shimmer
  float shimmer = trigShimmer(warpedUv, uTime);
  shimmer = smoothstep(0.70, 1.0, shimmer) * voidShape;

  // Cell-boundary ridges (glow along Worley edges)
  vec2 w = worley(warpedUv * voidScale * 2.3);
  float ridge = pow(1.0 - smoothstep(0.0, 0.12, w.y - w.x), 4.0);
  ridge *= medium * 0.6;

  // Overlap-count step palette
  float largeMask  = step(0.5, large);
  float mediumMask = step(0.5, medium);
  float fineMask   = step(0.5, fine);
  float overlapCount = largeMask + mediumMask + fineMask;

  vec3 col = color0;
  col = mix(col, color1, step(1.0, overlapCount));
  col = mix(col, color2, step(2.0, overlapCount));
  col = mix(col, color3, step(3.0, overlapCount));

  col += glowColor * shimmer * shimmerStrength;
  col += glowColor * ridge   * 0.22;

  gl_FragColor = vec4(col, 1.0);
}