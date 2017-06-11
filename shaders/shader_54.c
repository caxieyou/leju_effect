#define GLSLIFY 1
varying vec4 coord;

uniform sampler2D texture;
uniform vec4 overlayMask;
uniform float opacity;

void main() {
  const vec4 dotSum = vec4(1.0);

  lowp vec4 overlay = texture2D(texture, coord.xy);

  lowp float mask = dot(overlay * overlayMask, dotSum);

    gl_FragColor = vec4(1.0, 0.0, 0.0, mask * opacity);
}