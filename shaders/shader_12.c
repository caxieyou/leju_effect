#define GLSLIFY 1
// fragment_dehazemap2.cpp
// usage: use before rendering to generate map, smooth the transmission map based on prior 
// input: uniform sampler2D texture (generated from shader dehazemap1.cpp)
// output: gray image of transmission map(r=g=b=a), later I may want to use the redundant channels to save more information.
// ref: http://research.microsoft.com/en-us/um/people/jiansun/papers/dehaze_cvpr2009.pdf

varying vec4 coord;
uniform sampler2D texture;

float random(in vec3 scale, in float seed) {
  /* use the fragment position for a different seed per-pixel */
  return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

const int radius = 5;
const float sigma_s = 0.02;
const float sigma_c = 0.5 * 5.0 * 5.0;
const float wsize = 0.05 / float(radius * 2);
const float sigma_i = 0.5 * wsize * wsize / sigma_s / sigma_s;


void main() {

//  const int k_size = radius * 2 + 1;
//  float kernel[k_size];
//  for (int j = 0; j <= k_size; j++) {
//    kernel[k_size+j] = kernel[k_size-j] = exp(-float(j * j) * sigma_i);
//  }

  vec2 uv;
  vec3 diff;
  float weight;
  vec4 res = vec4(0.0);
  float res_w = 0.0;
  float offset = random(vec3(151.7182, 12.9898, 78.233), 0.0);
  lowp vec3 center_c = texture2D(texture, coord.xy).rgb;
  lowp vec4 tmp;

  for (int i = -radius; i <= radius; i++) {
      for (int j = -radius; j<= radius; j++) {
          uv = coord.xy + (vec2(float(i), float(j)) + offset - 0.5) * wsize;
          tmp = texture2D(texture, uv);
          diff = tmp.rgb - center_c;
          weight = exp(-min(float(i * i + j * j) * sigma_i, 10.0));
//          weight = kernel[radius+i] * kernel[radius+j];
          weight *= exp(-min(dot(diff, diff) * sigma_c, 10.0));
          res += tmp * weight;
          res_w += weight;
      }
  }

  res = res / res_w;
//  res.a = 1.0;//clamp(res.a, 1e-3, 1.0 - 1e-3);


  // contrast
//  vec3 base = res.rgb;
//  vec3 blend = mix(vec3(0.5), base, 0.15);
//  res.rgb = mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));

  gl_FragColor = vec4(res);
}