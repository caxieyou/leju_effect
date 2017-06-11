#define GLSLIFY 1
varying vec4 coord;

uniform sampler2D texture;
uniform vec2 textureResolution;

const float sigma_color = 0.15;
const float sigma = 1.0/sigma_color;
const float sigma_c = 0.5 * sigma * sigma;
const float radius = 7.0;
const float wsize = radius * 2.0 + 1.0;
const float sigma_s = 0.5 * wsize * wsize;

float luma(in vec3 color) {
    return dot(color, vec3(0.298839, 0.586811, 0.11435));
}

float random(in vec3 scale, in float seed) {
  /* use the fragment position for a different seed per-pixel */
  return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
  vec2 sigma_spatial = 1.0 / (textureResolution);
  float res_weight = 0.0;
  vec3 res_color = vec3(0.0);
  vec3 center_color = texture2D(texture, coord.xy).rgb;
  float lum = luma(center_color);
  float sigma_i = sigma_s * sigma_s * sigma_spatial.x * sigma_spatial.y;
  float offset = 0.0;//(random(vec3(151.7182, 12.9898, 78.233), 0.0) - 0.5) * radius;

  for (float i = -radius; i <= radius; i++) {
    for (float j = -radius; j <= radius; j++) {
      vec2 uv = coord.xy + (vec2(i, j)) * sigma_spatial;
      vec3 tmp_color = texture2D(texture, uv).rgb;
      vec3 diff = tmp_color - center_color;
      float diff_color = luma(tmp_color) - lum;
      float tmp_weight = exp(-min((i*i+j*j)*sigma_i,10.0));
      tmp_weight *= exp(-min(diff_color * diff_color * sigma_c,10.0));
      res_color += tmp_color * tmp_weight;
      res_weight += tmp_weight;
    }
  }

  gl_FragColor = vec4(res_color / res_weight, (1.0 / res_weight) * 2.0);
}