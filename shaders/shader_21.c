#define GLSLIFY 1
varying vec4 coord;
varying vec2 distortionCoord[3];

uniform sampler2D textures[4];

vec4 lookupTexture(in vec2 coords) {
  vec2 c = coords * 2.0;
  vec2 f = floor(c);
  int i = int(f.x + f.y * 2.0);
  vec2 uv = c - f;
  lowp vec4 col;

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

void main() {
  lowp vec3 inputDistort = vec3(
    lookupTexture(distortionCoord[0]).r,
    lookupTexture(distortionCoord[1]).g,
    lookupTexture(distortionCoord[2]).b
  );

  gl_FragColor = vec4(inputDistort, 1.0);
}