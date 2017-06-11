#define GLSLIFY 1
varying vec4 coord;

uniform sampler2D texture;

void main() {
  lowp vec3 col = texture2D(texture, coord.xy).rgb;
    gl_FragColor = vec4(col, 1.0);
}