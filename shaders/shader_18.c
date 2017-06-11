#define GLSLIFY 1
varying vec4 coord;

uniform sampler2D texture;
uniform float delta;
uniform float kernel[15];

const int radius = 7;
const float wsize = float(radius * 2 + 1);
const float sigma_color = 0.04;
const float sigma_c = 1.0 / sigma_color;
const float sigma = 0.5 * sigma_c * sigma_c;

float luma(in vec3 color){
    return dot(color, vec3(0.298839, 0.586811, 0.11435));
}

void main() {
  float res_weight = 0.0;
  vec3 res_color = vec3(0.0);
  vec3 center_color = texture2D(texture, coord.xy).rgb;
  float lum = luma(center_color);
  float diff, weight;
  vec4 tmp_color;

  for (int i = -radius; i <= radius; i++) {
      tmp_color = texture2D(texture, coord.xy + vec2(0.0, float(i) * delta));
      diff = luma(tmp_color.rgb) - lum;
      weight = kernel[radius+i] * exp(-min(diff * diff * sigma,10.0));
      res_color += tmp_color.rgb * (weight * tmp_color.a * wsize);
      res_weight += weight * tmp_color.a * wsize;
  }

  gl_FragColor = vec4(res_color / res_weight, (1.0 / res_weight) * 2.0);
}