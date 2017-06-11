#define GLSLIFY 1
varying vec4 coord;
varying vec2 offsetCoord[4];

uniform sampler2D texture;
uniform float sharpen;

void main() {

    lowp vec4 midColor = texture2D(texture, coord.xy);

    lowp vec4 sum = midColor * 5.0;

  sum -= texture2D(texture, offsetCoord[0]);
  sum -= texture2D(texture, offsetCoord[1]);
  sum -= texture2D(texture, offsetCoord[2]);
  sum -= texture2D(texture, offsetCoord[3]);

    gl_FragColor = mix(midColor, sum, sharpen);
}