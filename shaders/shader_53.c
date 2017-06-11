#define GLSLIFY 1
varying vec4 coord;
varying vec2 distortionCoord;

uniform sampler2D texture;
uniform sampler2D original;

void main() {
  lowp vec3 col = texture2D(texture, coord.xy).rgb;
  lowp float alpha = texture2D(original, distortionCoord).a;

    gl_FragColor = vec4(col, alpha);
}