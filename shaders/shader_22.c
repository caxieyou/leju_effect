#define GLSLIFY 1
varying vec4 coord;
varying vec4 compositeCoord;
varying vec2 distortionCoord;

uniform mat4 viewMatrix;
uniform float distortion_amount;
uniform float distortion_horizontal;
uniform float distortion_vertical;
uniform vec2 imgSize;

const vec2 center = vec2(0.5);
const vec2 center_hv = vec2(0.0, 0.5);
const float barrel_size = 0.5625;

void main() {
  vec4 distortionVertex = a_Distortion + vec4(a_Delta.xy, 0.0, 0.0);

  coord = viewMatrix * distortionVertex * 0.5 + 0.5;

  compositeCoord = a_TexCoord;

  float diag = length(imgSize);
  vec2 perspective = 0.4 / diag * imgSize;
  vec2 hv = vec2(distortion_horizontal, distortion_vertical);
  vec2 inv = 1.0 - step(0.0, hv);
  vec2 d, n;
  float r, c;
  float distortion = 1.0;
  float zoom = 1.0;

  vec2 coord_map = abs(inv - compositeCoord.xy);

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
    r = max(length(coord_map * imgSize) / c, 0.0001);
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

  distortionCoord = distortion * coord_map / zoom + center;

  gl_Position = viewMatrix * distortionVertex;
}