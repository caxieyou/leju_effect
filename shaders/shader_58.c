#define GLSLIFY 1
varying vec4 coord;

uniform sampler2D texture;
uniform float opacity;

void main() {
  lowp vec4 col = texture2D(texture, coord.xy);
  col *= opacity; // premultiplied
//  col.a *= opacity;


    gl_FragColor = col;

}