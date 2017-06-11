#define GLSLIFY 1
varying vec4 coord;

uniform vec4 color;
uniform sampler2D texture;

void main() {
  lowp vec4 base = texture2D(texture, coord.xy);
  lowp vec3 res = mix(base.rgb, color.rgb, color.a);

    gl_FragColor = vec4(res, 1.0);
}