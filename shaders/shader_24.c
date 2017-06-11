#define GLSLIFY 1
/* face enhancement shader */
varying vec4 coord;
varying vec2 distortionCoord;

/* same set of textures used in clarity*/
uniform sampler2D texture;
uniform sampler2D smoothMap;
uniform sampler2D faceMask;

uniform float skin_smoothness;
uniform float skin_tone;
uniform float skin_shadows;
uniform float skin_highlights;
uniform float skin_hue;
uniform float skin_saturation;
uniform float teeth_brightness;
uniform float teeth_whitening;
uniform float eyes_brightness;
uniform float eyes_contrast;
uniform float eyes_clarity;
uniform float lips_brightness;
uniform float lips_saturation;

/* const */
const mat3 matRGBtoROMM = mat3(0.5293459296226501, 0.3300727903842926, 0.14058130979537964, 0.09837432950735092, 0.8734610080718994, 0.028164653107523918, 0.01688321679830551, 0.11767247319221497, 0.8654443025588989);
const mat3 matROMMtoRGB = mat3(2.0340757369995117, -0.727334201335907, -0.3067416846752167, -0.22881317138671875, 1.2317301034927368, -0.0029169507324695587, -0.008569774217903614, -0.1532866358757019, 1.1618564128875732);
const float epsilon = 0.000001;
const float mx = 1.0 - epsilon;
const float PI = 3.1415926535897932384626433832795;

/* color related function */
float luma(in vec3 color){
  return dot(color, vec3(0.298839, 0.586811, 0.11435));
}

float luma_romm(in vec3 color){
    return dot(color, vec3(0.242655, 0.755158, 0.002187));
}

vec3 rgb2hsv(in vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(in vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 blendOverlay(in vec3 base, in vec3 blend){
  return mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));
}

float gaussian(in float x) {
  return exp(-PI*2.0*x*x);
}

/* wrap the exposure shader in the function */
vec3 setExposure(in vec3 base, in float exposure){
  float a = abs(exposure) * 1.0 + epsilon;
  float v = pow(2.0, a*2.0+1.0)-2.0;
  float m = mx - exp(-v);
  vec3 res = (exposure > 0.0) ? (1.0 - exp(-v*base)) / m : log(1.0-base*m) / -v;
  res = mix(base, res, min(a*100.0, 1.0));
  return res;
}

void main() {
  // sample textures
  lowp vec4 col = texture2D(texture, coord.xy);
  lowp vec3 map = texture2D(smoothMap, distortionCoord).rgb;
  lowp vec4 mask = texture2D(faceMask, distortionCoord);

  vec3 res = col.rgb;

  // lips = mask.r
  // teeth = mask.g
  // eyes = mask.b
  // skin = face excluded by lips, teeth, and eyes
  float skin_mask = 1.0 - clamp(mask.r * 0.5 + mask.g + mask.b, 0.0, 1.0);

  // convert to ROMM
  res = res * matRGBtoROMM;

  float mapLum = luma(map);
  float invLum = 1.0 - mapLum;

  // skin_smoothness, eye_clarity
  map = map * matRGBtoROMM;
  float clarity = -skin_smoothness * mapLum * skin_mask + eyes_clarity * mask.b;
  float intensity = clarity > 0.0 ? clarity * 4.0 : clarity * 2.0;
  vec3 lowPass = (res + (1.0 - map)) * 0.5;
  float lowPassLum = luma_romm(lowPass);
  lowPass = mix(vec3(lowPassLum), lowPass, mask.b);
  vec3 blend = clamp(mix(vec3(0.5), lowPass, intensity * col.a), 0.0, 1.0);
  res = blendOverlay(res, blend);

  // eye contrast
  blend = vec3(mix(0.5, luma_romm(res), eyes_contrast * mask.b));
  res = blendOverlay(res, blend);


  // skin_tone, skin_shadows, skin_highlights, eyes_brightness, lips_brightness
    float shadowsHighlights = mix(skin_highlights * mapLum * mapLum, skin_shadows * invLum * invLum, invLum);
  float exposure =
    (eyes_brightness * mask.b * 0.5) +
    (skin_tone * 0.3) +
    (shadowsHighlights * skin_mask) +
    (lips_brightness * mask.r * 0.3) +
    (teeth_brightness * mask.g);
  res = setExposure(res, exposure);

  // skin_saturation, skin_hue (shift orange)
  vec3 hsv = rgb2hsv(res);
  float orangeMask = (hsv.x - 0.084) / 0.3;
  float hueMask = gaussian(orangeMask) * min(1.0, hsv.y * 2.0);
  // weighted with skin color mask
  hsv.x += skin_hue * 0.05 * hueMask * skin_mask;
  hsv.y *= 1.0 + skin_saturation * 0.5 * skin_mask;

  // teeth_whitening
  float yellowMask = (hsv.x - 0.166) / 0.3;
  hsv.y *= 1.0 - teeth_whitening * mask.g * gaussian(yellowMask);

  // lips sat
  hsv.y = hsv.y * (1.0 + lips_saturation * mask.r);

  res = hsv2rgb(hsv);

  // out
  res = res * matROMMtoRGB;

  // mask result to face mask alpha
  res = mix(col.rgb, res, mask.a);

  // debug
//  res = mix(res, mask.rgb, mask.a * 0.8);
//  res = vec3(skin_mask);
//  res = map.rgb;

  gl_FragColor = vec4(res, col.a);
}