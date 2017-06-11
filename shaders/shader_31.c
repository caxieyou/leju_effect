#define GLSLIFY 1
varying vec4 coord;
varying vec4 compositeCoord;

uniform sampler2D texture;
uniform sampler2D blurTexture;
uniform float mosaic_size; /*0~1 match t  o -> 0.01~1.0 */

uniform float distortion_amount;
uniform float distortion_horizontal;
uniform float distortion_vertical;
uniform vec2 imgSize;

vec2 distort(in vec2 coord) {
  const vec2 center = vec2(0.5);
  const vec2 center_hv = vec2(0.0, 0.5);
  const float barrel_size = 0.5625;

  float diag = length(imgSize);
  vec2 perspective = 0.2 / diag * imgSize;
  vec2 hv = vec2(distortion_horizontal, distortion_vertical);
  vec2 inv = 1.0 - step(0.0, hv);
  vec2 d, n;
  float r, c;
  float distortion = 1.0;
  float zoom = 1.0;

  vec2 coord_map = abs(inv - coord);

  if (distortion_horizontal != 0.0) {
    n = coord_map - center_hv.xy;
    d = 1.0 - abs(distortion_horizontal) * perspective;
    n = mix(n, n * d, vec2(1.0, n.x));
    coord_map = n + center_hv.xy;
  }

  if (distortion_vertical != 0.0) {
    n = coord_map - center_hv.yx;
    d = 1.0 - abs(distortion_vertical) * perspective;
    n = mix(n, n * d, vec2(n.y, 1.0));
    coord_map = n + center_hv.yx;
  }

  coord_map = abs(inv - coord_map) - center;

  if (distortion_amount < 0.0) {
    c = diag / (distortion_amount * -4.0);
    r = length(coord_map * imgSize) / c;
    distortion = atan(r)/r;
    r = max(-0.5 * imgSize.x, -0.5 * imgSize.y) / c;
    zoom = atan(r)/r;
  }

  if (distortion_amount > 0.0) {
    r = dot(coord_map, coord_map) * barrel_size;
    c = distortion_amount * 2.0;
    distortion = 1.0 + r * c;
    zoom = 1.0 + (0.5 * barrel_size) * c;
  }

  return distortion * coord_map / zoom + center;
}

vec2 coord2grid(vec2 coord_current, vec2 mosaic_size_scale)
{
  vec2 grid_current = coord_current - 0.5;
  grid_current = floor(grid_current / (mosaic_size_scale + 0.0001) + 0.5) * mosaic_size_scale + 0.5;
  return grid_current;
}


void main() {
  /* compute mosaic block size and make sure it is squre */
  vec2 mosaic_size_scale = vec2((0.01 + mosaic_size * mosaic_size) * min(imgSize.x, imgSize.y)) / imgSize;
  vec2 coord_grid = coord2grid(compositeCoord.xy, mosaic_size_scale);
  vec3 color = texture2D(blurTexture, distort(coord_grid)).rgb;
  vec4 color_original = texture2D(texture,coord.xy);
  color = mix(color_original.rgb, color, float(mosaic_size>0.0));
  gl_FragColor = vec4(mix(color_original.rgb, color, color_original.a), color_original.a);
}