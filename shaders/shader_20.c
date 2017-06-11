#define GLSLIFY 1
varying vec4 coord;
varying vec2 distortionCoord[3];

uniform sampler2D texture;

void main() {
  lowp vec3 inputDistort = vec3(
    texture2D(texture, distortionCoord[0]).r,
    texture2D(texture, distortionCoord[1]).g,
    texture2D(texture, distortionCoord[2]).b
  );

  gl_FragColor = vec4(inputDistort, 1.0);
}