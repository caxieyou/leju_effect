#define GLSLIFY 1
varying vec4 coord;

uniform sampler2D texture;
uniform vec2 delta;

float random(vec3 scale, float seed) {
  /* use the fragment position for a different seed per-pixel */
  return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
  /* randomize the lookup values to hide the fixed number of samples */
  float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

  float percent, weight, total = 0.0;
  lowp vec4 col, color = vec4(0.0);
  const float radius = 6.0;

  for (float t = -radius; t <= radius; t++) {
    percent = (t + offset - 0.5) / radius;
    col = vec4(
      texture2D(texture, coord.xy + delta * 0.7 * percent).rgb,
      texture2D(texture, coord.xy + delta * 2.0 * percent).a
    );
    col.a = pow(col.a, 0.5);
    weight = 1.0 - abs(percent);
    color += col * weight;
    total += weight;
  }

  gl_FragColor = vec4(color / total);
}