#define GLSLIFY 1
varying vec4 coord;

uniform sampler2D textures[4];

vec4 lookupTexture(vec2 coords) {
  vec2 c = coords * 2.0;
  vec2 f = floor(c);
  int i = int(f.x + f.y * 2.0);
  vec2 uv = vec2(c.x - f.x, c.y - f.y);
  vec4 col;

    if (i == 0) {
    col = texture2D(textures[0], uv);
  } else if (i == 1) {
    col = texture2D(textures[1], uv);
  } else if (i == 2) {
    col = texture2D(textures[2], uv);
  } else /* if (i == 3) */ {
    col = texture2D(textures[3], uv);
  }

    return col;
}


void main(){
    gl_FragColor = lookupTexture(coord.xy);
}