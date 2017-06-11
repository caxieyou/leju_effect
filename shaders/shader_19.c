#define GLSLIFY 1
varying vec4 coord;
varying vec2 distortionCoord;

uniform sampler2D texture;
uniform sampler2D smoothMap;

uniform float diffuse;

float luma(in vec3 color){
    return dot(color, vec3(0.298839, 0.586811, 0.11435));
}

void main() {
  lowp vec3 col = texture2D(texture, coord.xy).rgb;
  lowp vec3 map = texture2D(smoothMap, distortionCoord).rgb;

  vec3 diffuseMap = map / 2.0 + 0.5;
  float mask = 1.0 - pow(luma(col), 2.72);
  vec3 blend = mix(vec3(0.5), diffuseMap, diffuse * 2.0 * mask);
  vec3 res = sqrt(col) * (2.0 * blend - 1.0) + 2.0 * col * (1.0 - blend);

  gl_FragColor = vec4(res, 1.0);
}