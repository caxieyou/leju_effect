#define GLSLIFY 1
varying vec4 coord;
varying vec2 distortionCoord;

uniform sampler2D texture;
uniform sampler2D original;

uniform sampler2D textures[4];

float lookupTexture(vec2 coords) {
  vec2 c = coords * 2.0;
  vec2 f = floor(c);
  int i = int(f.x + f.y * 2.0);
  vec2 uv = vec2(c.x - f.x, c.y - f.y);
  lowp float col;

    if (i == 0) {
    col = texture2D(textures[0], uv).a;
  } else if (i == 1) {
    col = texture2D(textures[1], uv).a;
  } else if (i == 2) {
    col = texture2D(textures[2], uv).a;
  } else /* if (i == 3) */ {
    col = texture2D(textures[3], uv).a;
  }

    return col;
}

void main() {
  lowp vec3 col = texture2D(texture, coord.xy).rgb;
  lowp float alpha = lookupTexture(distortionCoord);

    gl_FragColor = vec4(col, alpha);
}