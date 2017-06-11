#define GLSLIFY 1
varying vec4 coord;

uniform sampler2D texture;

void main() {
    gl_FragColor = texture2D(texture, coord.xy);
}