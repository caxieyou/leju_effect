#define GLSLIFY 1
varying vec4 coord;
varying vec4 backgroundCoords;

uniform sampler2D texture;
uniform sampler2D layerTexture;
uniform vec4 colorOverlay;
uniform float opacity;
uniform float blendMode;

float sat(in vec3 c){
    float n = min(min(c.r, c.g), c.b);
    float x = max(max(c.r, c.g), c.b);

    return x - n;
}

vec3 setSat(in vec3 c, in float s){
    float cmin = min(min(c.r, c.g), c.b);
    float cmax = max(max(c.r, c.g), c.b);

    vec3 res = vec3(0.0);

    if (cmax > cmin) {

        if (c.r == cmin && c.b == cmax) { // R min G mid B max
            res.r = 0.0;
            res.g = ((c.g-cmin)*s) / (cmax-cmin);
            res.b = s;
        }
        else if (c.r == cmin && c.g == cmax) { // R min B mid G max
            res.r = 0.0;
            res.b = ((c.b-cmin)*s) / (cmax-cmin);
            res.g = s;
        }
        else if (c.g == cmin && c.b == cmax) { // G min R mid B max
            res.g = 0.0;
            res.r = ((c.r-cmin)*s) / (cmax-cmin);
            res.b = s;
        }
        else if (c.g == cmin && c.r == cmax) { // G min B mid R max
            res.g = 0.0;
            res.b = ((c.b-cmin)*s) / (cmax-cmin);
            res.r = s;
        }
        else if (c.b == cmin && c.r == cmax) { // B min G mid R max
            res.b = 0.0;
            res.g = ((c.g-cmin)*s) / (cmax-cmin);
            res.r = s;
        }
        else { // B min R mid G max
            res.b = 0.0;
            res.r = ((c.r-cmin)*s) / (cmax-cmin);
            res.g = s;
        }

    }

    return res;
}

float luma(in vec3 color){
    return dot(color, vec3(0.298839, 0.586811, 0.11435));
}

vec3 clipColor(in vec3 c) {
    float l = luma(c);
    float n = min(min(c.r, c.g), c.b);
    float x = max(max(c.r, c.g), c.b);

    if (n < 0.0) c = (c-l)*l / (l-n) + l;
    if (x > 1.0) c = (c-l) * (1.0-l) / (x-l) + l;

    return c;
}

vec3 setLuma(in vec3 c, in float l) {
    float d = l - luma(c);

    c.r = c.r + d;
    c.g = c.g + d;
    c.b = c.b + d;

    return clipColor(c);
}

vec3 blendLighten(in vec3 base, in vec3 blend) {
    return max(blend, base);
}

vec3 blendDarken(in vec3 base, in vec3 blend) {
    return min(blend, base);
}

vec3 blendMultiply(in vec3 base, in vec3 blend) {
  return base * blend;
}

vec3 blendDivide(in vec3 base, in vec3 blend) {
  return base / blend;
}

vec3 blendAdd(in vec3 base, in vec3 blend) {
  return min(base + blend, vec3(1.0));
}

vec3 blendSubtract(in vec3 base, in vec3 blend) {
  return max(base + blend - vec3(1.0), vec3(0.0));
}

vec3 blendDifference(in vec3 base, in vec3 blend) {
  return abs(base - blend);
}

vec3 blendExclusion(in vec3 base, in vec3 blend) {
  return (base + blend - 2.0 * base * blend);
}

float blendScreen(in float base, in float blend) {
    return 1.0-((1.0-base)*(1.0-blend));
}

vec3 blendScreen(in vec3 base, in vec3 blend) {
    return vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));
}

float blendOverlay(in float base, in float blend) {
    return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(in vec3 base, in vec3 blend) {
    return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

float blendSoftLight(in float base, in float blend) {
    return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
}

vec3 blendSoftLight(in vec3 base, in vec3 blend) {
    return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
}

vec3 blendHardLight(in vec3 base, in vec3 blend) {
    return blendOverlay(blend,base);
}

float blendColorDodge(in float base, in float blend) {
    return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
}

vec3 blendColorDodge(in vec3 base, in vec3 blend) {
    return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
}

float blendColorBurn(in float base, in float blend) {
    return (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);
}

vec3 blendColorBurn(in vec3 base, in vec3 blend) {
    return vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));
}

float blendLinearLight(in float base, in float blend) {
    return blend<0.5?max(base+(2.0*blend)-1.0, 0.0):min(base+(2.0*(blend-0.5)), 1.0);
}

vec3 blendLinearLight(in vec3 base, in vec3 blend) {
    return vec3(blendLinearLight(base.r,blend.r),blendLinearLight(base.g,blend.g),blendLinearLight(base.b,blend.b));
}

float blendVividLight(in float base, in float blend) {
    return (blend<0.5)?blendColorBurn(base,(2.0*blend)):blendColorDodge(base,(2.0*(blend-0.5)));
}

vec3 blendVividLight(in vec3 base, in vec3 blend) {
    return vec3(blendVividLight(base.r,blend.r),blendVividLight(base.g,blend.g),blendVividLight(base.b,blend.b));
}

vec3 blendHue(in vec3 base, in vec3 blend) {
  return setLuma(setSat(blend, sat(base)), luma(base));
}

vec3 blendSaturation(in vec3 base, in vec3 blend) {
  return setLuma(setSat(base, sat(blend)), luma(base));
}

vec3 blendColor(in vec3 base, in vec3 blend) {
  return setLuma(blend, luma(base));
}

vec3 blendLuminosity(in vec3 base, in vec3 blend) {
  return setLuma(base, luma(blend));
}

void main() {

  lowp vec3 base = texture2D(texture, backgroundCoords.xy).rgb;
  lowp vec4 layer = texture2D(layerTexture, coord.xy);
  lowp vec3 blend = mix(layer.rgb, colorOverlay.rgb, colorOverlay.a);


       if (blendMode ==  1.0) blend = blendDarken(base, blend);
  else if (blendMode ==  2.0) blend = blendMultiply(base, blend);
  else if (blendMode ==  3.0) blend = blendColorBurn(base, blend);
  else if (blendMode ==  4.0) blend = blendSubtract(base, blend); // linear burn
  else if (blendMode ==  5.0) blend = blendLighten(base, blend);
  else if (blendMode ==  6.0) blend = blendScreen(base, blend);
  else if (blendMode ==  7.0) blend = blendColorDodge(base, blend);
  else if (blendMode ==  8.0) blend = blendAdd(base, blend); // linear dodge
  else if (blendMode ==  9.0) blend = blendOverlay(base, blend);
  else if (blendMode == 10.0) blend = blendSoftLight(base, blend);
  else if (blendMode == 11.0) blend = blendHardLight(base, blend);
  else if (blendMode == 12.0) blend = blendVividLight(base, blend);
  else if (blendMode == 13.0) blend = blendLinearLight(base, blend);
  else if (blendMode == 14.0) blend = blendDifference(base, blend);
  else if (blendMode == 15.0) blend = blendExclusion(base, blend);
  else if (blendMode == 16.0) blend = blendSubtract(base, blend);
  else if (blendMode == 17.0) blend = blendDivide(base, blend);
  else if (blendMode == 18.0) blend = blendHue(base, blend);
  else if (blendMode == 19.0) blend = blendSaturation(base, blend);
  else if (blendMode == 20.0) blend = blendColor(base, blend);
  else if (blendMode == 21.0) blend = blendLuminosity(base, blend);
  else if (blendMode == 22.0) blend = base; // passthrough

    gl_FragColor = vec4(blend, layer.a * opacity);
}