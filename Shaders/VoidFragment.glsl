// -+- Pixel Art Void Shader Authored by Tristan McCaskill -+-

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

// -- Simple Options --
float pixelSize = 8.0;
float voidScale = 6.0;
float voidSpeed = 0.005;
float warpStrength = 0.05;
float shimmerStrength = 0.06;

// -- Color Palette --
vec3 color0 = vec3(0.07, 0.08, 0.10);
vec3 color1 = vec3(0.09, 0.11, 0.13);
vec3 color2 = vec3(0.12, 0.15, 0.18);
vec3 color3 = vec3(0.16, 0.19, 0.22);

vec3 glowColor = vec3(0.32, 0.35, 0.42);

// -- Noise --
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;

  for (int i = 0; i < 5; i++) {
    v += noise(p) * amp;
    p *= 2.03;
    p += vec2(13.1, 7.7);
    amp *= 0.5;
  }

  return v;
}

vec2 warp(vec2 uv) {
  float t = uTime * voidSpeed;

  vec2 q = vec2(
    fbm(uv * 2.0 + vec2(t, 0.0)),
    fbm(uv * 2.0 + vec2(5.2, 1.3 - t))
  );

  vec2 r = vec2(
    fbm(uv * 4.0 + q * 2.5 + vec2(1.7, 9.2 + t)),
    fbm(uv * 4.0 + q * 2.5 + vec2(8.3 - t, 2.8))
  );

  return uv + r * warpStrength;
}

void main() {

  vec2 fragCoord = vUv * uResolution;

  vec2 uv = floor(fragCoord / pixelSize) * pixelSize;
  uv /= uResolution.xy;
  uv.x *= uResolution.x / uResolution.y;

  vec2 vuv = warp(uv);

  float largeVoid  = fbm(vuv * voidScale + vec2(uTime * 0.08, 0.0));
  float mediumVoid = fbm(vuv * voidScale * 2.2 - vec2(0.0, uTime * 0.12));
  float fineVoid   = fbm(vuv * voidScale * 5.0 + vec2(uTime * 0.03));

  largeVoid  = smoothstep(0.25, 0.85, largeVoid);
  mediumVoid = smoothstep(0.35, 0.75, mediumVoid);
  fineVoid   = smoothstep(0.45, 0.70, fineVoid);

  float voidShape = largeVoid * 0.65 + mediumVoid * 0.35;
  voidShape *= 0.75 + fineVoid * 0.45;

  float shimmer = sin(
    (vuv.x * 7.0 + vuv.y * 13.0 + mediumVoid * 5.0) * 6.28318
    + uTime * 1.4
  );

  shimmer = smoothstep(0.72, 1.0, shimmer * 0.5 + 0.5);

  // subtle arcing ribbons
  float arcs = sin(
    vuv.x * 12.0 +
    mediumVoid * 5.0 +
    fineVoid * 2.0 -
    uTime * 0.8
  );

  arcs = abs(arcs);
  arcs = pow(1.0 - arcs, 6.0);

  arcs *= mediumVoid * 0.7;

  // Convert soft layers into overlap masks
  float largeMask = step(0.5, largeVoid);
  float mediumMask = step(0.5, mediumVoid);
  float fineMask = step(0.5, fineVoid);

  float overlapCount = largeMask + mediumMask + fineMask;

  vec3 col = color0;
  col = mix(col, color1, step(1.0, overlapCount));
  col = mix(col, color2, step(2.0, overlapCount));
  col = mix(col, color3, step(3.0, overlapCount));

  // Subtle glow only where layers exist
  col += glowColor * shimmer * voidShape * shimmerStrength;

  // ethereal ribbon energy
  col += glowColor * arcs * 0.12;

  gl_FragColor = vec4(col, 1.0);
}
