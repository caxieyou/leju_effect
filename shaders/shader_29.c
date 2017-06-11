#define GLSLIFY 1
varying vec4 coord;

uniform sampler2D texture;
uniform float radius;
//uniform float bokeh;

float random(vec3 scale, float seed) {
  /* use the fragment position for a different seed per-pixel */
  return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

float Lum(vec3 c){
    return 0.299*c.r + 0.587*c.g + 0.114*c.b;
}

void main() {

//  vec3 color = vec3(0.0);
//  float total = 0.0;

  /* randomize the lookup values to hide the fixed number of samples */
//  float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

  vec4 center = texture2D(texture, coord.xy);

  vec3 color = vec3(0.0);
  float total = 0.0;
  float r = radius * center.a;
  float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0) / 30.0 * r;
//  float threshold = 1.0 - bokeh;
//  float gain = 1.0 + 50.0 * bokeh;
//  vec3 base = vec3(0.0);

  for (float x = -15.0; x <= 15.0; x++) {
    for (float y = -15.0; y <= 15.0; y++) {
      vec2 pos = coord.xy + vec2(x, y) / 15.0 * r;
      float weight = 1.0 - floor(distance(pos, coord.xy)/r);
//        vec3 col = texture2D(texture, pos + offset).rgb;
//        float lum = Lum(col.rgb);
//        color += col + mix(base, col, max((lum-threshold)*gain, 0.0) * r);
      color += texture2D(texture, pos + offset).rgb * weight;
      total += weight;
    }
  }

  gl_FragColor = vec4(color / total, center.a);
}