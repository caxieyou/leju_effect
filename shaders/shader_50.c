#define GLSLIFY 1
varying vec4 coord;
varying vec4 compositeCoord;

uniform float opacity;
uniform float alpha;
uniform float invert;
uniform vec4 channel;
uniform sampler2D texture;
uniform sampler2D brushTexture;

void main() {
  vec4 col = texture2D(texture, coord.xy);
  vec4 brush = texture2D(brushTexture, compositeCoord.xy);
  float mask = dot(brush, channel);

  if (invert > 0.0) mask = 1.0 - mask;

  float a = clamp(col.a * alpha + mask * opacity, 0.0, 1.0);

    gl_FragColor = vec4(col.rgb, a);
}