#define GLSLIFY 1
// fragment_dehaze.cpp
// usage: use during rendering, correct dehazing using transition map
// input: uniform sampler2D texture (loaded image)
// input: uniform sampler2D map_t (generated from shader dehazemap2.cpp)
// input: uniform float dehaze_scale from -1.0 to 1.0
// output: dehazed image
// ref: http://research.microsoft.com/en-us/um/people/jiansun/papers/dehaze_cvpr2009.pdf
// https://www.shadertoy.com/view/4tXXz4


varying vec4 coord;
varying vec2 distortionCoord;

uniform sampler2D texture;
uniform sampler2D dehazeMap;

uniform float dehaze; // -1.0~1.0
uniform vec3 average;

const float mix_scale = 0.5;

void main() {
  lowp vec3 base = texture2D(texture, coord.xy).rgb;

  // transmission
  float transmission = texture2D(dehazeMap, distortionCoord).a;

  // correction
  vec3 dehaze_color = vec3(1.0);
//  dehaze_color = mix(dehaze_color, average, mix_scale);
  float dehaze_adjust = clamp(1.0/transmission, 1.0, 5.0) - 1.0;
  dehaze_adjust = mix(dehaze_adjust, pow(dehaze_adjust, 0.2), step(1.0, dehaze_adjust)) + 1.0;
  vec3 J = clamp(((base-dehaze_color) * dehaze_adjust + dehaze_color), 0.0, 1.0);


  // dehaze (-1,1)->d(0,1)
  float d = 1.0 - dehaze;
  float mixv = pow(transmission, d);
  vec3 res = mix(dehaze_color, J, mixv);

  // mix
  res = mix(base, res, abs(dehaze));

  gl_FragColor = vec4(res, 1.0);
}