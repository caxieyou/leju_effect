#define GLSLIFY 1
varying vec4 coord;
varying vec4 compositeCoord;
varying vec2 distortionCoord;

uniform float feather;
uniform float angle;
uniform vec2 position;
uniform vec2 sourcePosition;
uniform vec2 size;
uniform float opacity;
uniform float mode;

uniform sampler2D texture;
uniform sampler2D smoothTexture;
uniform sampler2D originalTexture;
uniform sampler2D retouchTexture;
uniform vec2 imgSize;


float blendLinearLight(in float base, in float blend) {
    return blend<0.5?max(base+(2.0*blend)-1.0, 0.0):min(base+(2.0*(blend-0.5)), 1.0);
}

vec3 blendLinearLight(in vec3 base, in vec3 blend) {
    return vec3(blendLinearLight(base.r,blend.r),blendLinearLight(base.g,blend.g),blendLinearLight(base.b,blend.b));
}

float random(vec3 scale, float seed) {
    /* use the fragment position for a different seed per-pixel */
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

vec2 rotate(in vec2 vec, in float angle, in vec2 origin) {
  float rads = radians(angle);
  float s = sin(rads);
  float c = cos(rads);

    vec = (vec - origin) * imgSize;
    vec = (vec2(
      vec.x * c - vec.y * s,
    vec.x * s + vec.y * c
  ) / imgSize + origin);

  return vec;
}


void main() {
  vec2 sourceCoords = rotate(distortionCoord.xy - 0.5, angle, sourcePosition) + 0.5;

  lowp vec4 tex = texture2D(texture, coord.xy);
  lowp vec4 blurMap = texture2D(retouchTexture, compositeCoord.xy);
  lowp vec4 smoothMap = texture2D(smoothTexture, sourceCoords);
  lowp vec4 orig = texture2D(originalTexture, sourceCoords);

  float blur = min(1.0 - feather, 0.990);

  vec2 coords = rotate(compositeCoord.xy - 0.5, angle, position) / size;

  float offset = 2.0;
  float dist = distance(coords * offset, position / size * offset);
  dist += random(vec3(12.9898, 78.233, 151.7182), 1.0)/50.0 * (1.0 - blur);

  float mask = smoothstep(1.0, blur, dist) * opacity;

  lowp vec3 col;

  // heal
  if (mode == 1.0) {
    col = mix(tex.rgb, blurMap.rgb, min(blurMap.a / 0.05, 1.0));

    vec3 lowPass = (orig.rgb + (1.0 - smoothMap.rgb)) * 0.5;
    col = blendLinearLight(col, lowPass.rgb);
    col = mix(tex.rgb, col, mask);

  // clone
  } else {
    col = mix(tex.rgb, orig.rgb, mask);
  }

    gl_FragColor = vec4(col, tex.a);
}