#define GLSLIFY 1
varying vec4 coord;
varying vec4 compositeCoord;

uniform sampler2D texture;
uniform sampler2D cacheTexture;
uniform lowp float showTexture;
uniform vec2 img_size;
uniform vec2 grid_size;
uniform float zoom;
uniform float opacity;

void main() {
  vec2 resolution = img_size * zoom;
  vec2 min_threshold = 1.0 / (resolution * 0.5 / grid_size);
  vec2 max_threshold = 1.0 - min_threshold;

  lowp vec2 mask = ceil(fract(clamp(compositeCoord.xy, 0.0, 1.0)));
  lowp vec4 c1 = texture2D(cacheTexture, coord.xy);
  lowp vec4 c2 = texture2D(texture, compositeCoord.xy);

  lowp vec4 col = mix(c1, c2, mask.x * mask.y * showTexture);

  vec2 c = (coord.xy - 0.5) * (1.0 - min_threshold * 0.5) + 0.5;
  vec2 grid = fract(c * grid_size - min_threshold * 0.5);

  // draw grid
  if((grid.x > max_threshold.x) || (grid.y > max_threshold.y)) {
      col = mix(col, vec4(1.0), 0.5);
  }

  // debug
  col.a = opacity;

  gl_FragColor = col;
}