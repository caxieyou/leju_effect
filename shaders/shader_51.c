#define GLSLIFY 1
varying vec4 coord;
varying vec4 compositeCoord;

uniform vec2 startPoint;
uniform vec2 endPoint;
uniform vec2 imgSize;
uniform float opacity;
uniform float alpha;
uniform float invert;
uniform float reflect;

uniform sampler2D texture;

void main() {
  vec4 col = texture2D(texture, coord.xy);

  vec2 compositeCoords = compositeCoord.xy - 0.5;
    vec2 coords = vec2(compositeCoords.x, 1.0 - compositeCoords.y) * imgSize;

  vec2 start = vec2(startPoint.x, startPoint.y + 1.0) * imgSize;
  vec2 end = vec2(endPoint.x, endPoint.y + 1.0) * imgSize;

  vec2 direction = end - start;
  direction /= length(direction);
  float scale = dot(direction, end - start);
  float value = dot(direction, coords - start) / scale;
  float mask = (reflect > 0.0) ? abs(1.0-value*2.0) : clamp(1.0-value, 0.0, 1.0);

  if (invert > 0.0) mask = 1.0 - mask;

  float a = clamp(col.a * alpha + mask * opacity, 0.0, 1.0);

    gl_FragColor = vec4(col.rgb, a);
}