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

  vec4 center = texture2D(texture, coord.xy);

  float percent, weight, total = 0.0;
  vec4 col, color = vec4(0.0);

  for (float t = -20.0; t <= 20.0; t++) {
    percent = (t + offset - 0.5) / 20.0;
    col = texture2D(texture, coord.xy + (delta * center.a) * percent);
    weight = (1.0 - abs(percent)) * max(col.a, 0.001);
    color += col * weight;
    total += weight;
  }

  gl_FragColor = vec4(color / total);
}