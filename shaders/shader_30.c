#define GLSLIFY 1
varying vec4 coord;
varying vec4 compositeCoord;
varying vec2 distortionCoord;

uniform float threshold;
uniform float feather;
uniform float invert;
uniform float useRadius;
uniform float angle;
uniform vec2 position;
uniform vec2 size;
uniform float opacity;
uniform float alpha;
uniform vec2 imgSize;

uniform sampler2D texture;
uniform sampler2D colorMap;

const float epsilon = 0.000001;
const float mx = 1.0 - epsilon;
const float kE = 216.0 / 24389.0;
const float kK = 24389.0 / 27.0;
const float kKE = 8.0;
const float PI = 3.1415926535897932384626433832795;

const vec3 D50 = vec3(0.96422, 1.0, 0.82521);
const vec3 D65 = vec3(0.95047, 1.0, 1.08883);

const mat3 matRGBtoROMM = mat3(0.5293459296226501, 0.3300727903842926, 0.14058130979537964, 0.09837432950735092, 0.8734610080718994, 0.028164653107523918, 0.01688321679830551, 0.11767247319221497, 0.8654443025588989);
const mat3 matROMMtoRGB = mat3(2.0340757369995117, -0.727334201335907, -0.3067416846752167, -0.22881317138671875, 1.2317301034927368, -0.0029169507324695587, -0.008569774217903614, -0.1532866358757019, 1.1618564128875732);

const mat3 matROMMtoXYZ = mat3(0.7976749, 0.1351917, 0.0313534, 0.2880402, 0.7118741, 0.0000857, 0.0000000, 0.0000000, 0.8252100);
const mat3 matXYZtoROMM = mat3(1.3459433, -0.2556075, -0.0511118, -0.5445989, 1.5081673, 0.0205351, 0.0000000, 0.0000000, 1.2118128);

const mat3 matRGBtoXYZ = mat3(0.4124564390896922, 0.357576077643909, 0.18043748326639894, 0.21267285140562253, 0.715152155287818, 0.07217499330655958, 0.0193338955823293, 0.11919202588130297, 0.9503040785363679);
const mat3 matXYZtoRGB = mat3(3.2404541621141045, -1.5371385127977166, -0.498531409556016, -0.9692660305051868, 1.8760108454466942, 0.041556017530349834, 0.055643430959114726, -0.2040259135167538, 1.0572251882231791);

const mat3 matAdapt = mat3(0.8951, 0.2664, -0.1614, -0.7502, 1.7135, 0.0367, 0.0389, -0.0685, 1.0296);
const mat3 matAdaptInv = mat3(0.9869929054667123, -0.14705425642099013, 0.15996265166373125, 0.43230526972339456, 0.5183602715367776, 0.0492912282128556, -0.008528664575177328, 0.04004282165408487, 0.9684866957875502);


vec3 hsv2rgb(in vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgb2xyz(in vec3 rgb, in vec3 d, in vec3 s) {
    vec3 xyz;

    xyz = rgb * matRGBtoXYZ;

    // adaption
    xyz = (xyz * matAdapt) * (d/s) * matAdaptInv;

    return xyz;
}

vec3 xyz2rgb(in vec3 xyz, in vec3 d, in vec3 s) {
    vec3 rgb;

    // adaption
    xyz = (xyz * matAdapt) * (s/d) * matAdaptInv;

    rgb = xyz * matXYZtoRGB;

    return rgb;
}

vec3 xyz2lab(in vec3 xyz, in vec3 refWhite) {
    vec3 r = xyz / refWhite;

    vec3 f = vec3(
        (r.x > kE) ? pow(r.x, 1.0 / 3.0) : ((kK * r.x + 16.0) / 116.0),
        (r.y > kE) ? pow(r.y, 1.0 / 3.0) : ((kK * r.y + 16.0) / 116.0),
        (r.z > kE) ? pow(r.z, 1.0 / 3.0) : ((kK * r.z + 16.0) / 116.0)
    );

    return vec3(
    116.0 * f.y - 16.0,
    500.0 * (f.x - f.y),
    200.0 * (f.y - f.z)
  );
}

vec3 lab2xyz(in vec3 lab, in vec3 refWhite) {
    float fy = (lab.x + 16.0) / 116.0;
    float fx = 0.002 * lab.y + fy;
    float fz = fy - 0.005 * lab.z;

    float fx3 = fx * fx * fx;
    float fz3 = fz * fz * fz;

    vec3 xyz = vec3(
    (fx3 > kE) ? fx3 : ((116.0 * fx - 16.0) / kK),
    (lab.x > kKE) ? pow((lab.x + 16.0) / 116.0, 3.0) : (lab.x / kK),
    (fz3 > kE) ? fz3 : ((116.0 * fz - 16.0) / kK)
  );

  return xyz * refWhite;
}

vec3 lab2lch(in vec3 lab) {
    vec3 lch = vec3(
        lab.x,
        sqrt(lab.y * lab.y + lab.z * lab.z),
        180.0 * atan(lab.z, lab.y) / PI
    );
    if (lch.z < 0.0) lch.z += 360.0;
    return lch;
}

vec3 lch2lab(in vec3 lch) {
    return vec3(
        lch.x,
        lch.y * cos(lch.z * PI / 180.0),
        lch.y * sin(lch.z * PI / 180.0)
    );
}

vec3 invCompand(in vec3 companded) {
  return vec3(
    (companded.r <= 0.04045) ? (companded.r / 12.92) : pow((companded.r + 0.055) / 1.055, 2.4),
    (companded.g <= 0.04045) ? (companded.g / 12.92) : pow((companded.g + 0.055) / 1.055, 2.4),
    (companded.b <= 0.04045) ? (companded.b / 12.92) : pow((companded.b + 0.055) / 1.055, 2.4)
  );
}

float random(vec3 scale, float seed) {
    /* use the fragment position for a different seed per-pixel */
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
  float blur = min(1.0 - feather, 0.990);
  float rads = radians(angle);
  float _s = sin(rads);
  float _c = cos(rads);
    vec2 coords = (compositeCoord.xy - 0.5 - position) * imgSize;
    coords = (vec2(
      coords.x * _c - coords.y * _s,
    coords.x * _s + coords.y * _c
  ) / imgSize + position) / size;

  vec4 col = texture2D(texture, coord.xy);
  vec3 map = texture2D(colorMap, distortionCoord).rgb;
  vec3 sel = texture2D(colorMap, position + 0.5).rgb;

  // convert to linear
  map = invCompand(map);
  sel = invCompand(sel);

    vec2 offset = 1.0 + (1.0 - vec2(feather));
  float dist = distance(coords * offset, position / size * offset);
  dist += random(vec3(12.9898, 78.233, 151.7182), 1.0)/50.0 * (1.0 - blur);

  float mask = (useRadius == 1.0) ? smoothstep(1.0, blur, dist) : 1.0;

  //  color mask
  vec3 refWhite = D50;
  vec3 refWhiteRGB = D65;
  vec3 d = refWhite * matAdapt;
  vec3 s = refWhiteRGB * matAdapt;

  vec3 mapLCH = (xyz2lab(rgb2xyz(map,d,s),refWhite));
  vec3 selLCH = (xyz2lab(rgb2xyz(sel,d,s),refWhite));

  float ml = mapLCH.x/100.0;
  float ms = mapLCH.y/100.0;
  float mh = mapLCH.z/100.0;
  float sl = selLCH.x/100.0;
  float ss = selLCH.y/100.0;
  float sh = selLCH.z/100.0;

  float t = threshold * 0.98 + 0.01;
  float lMask = clamp(1.0 - (abs(ml - sl)) / t, 0.0, 1.0);
  float aMask = clamp(1.0 - (abs(ms - ss)) / t, 0.0, 1.0);
  float bMask = clamp(1.0 - (abs(mh - sh)) / t, 0.0, 1.0);

  float colorMask = clamp(aMask * bMask * lMask, 0.0, 1.0);

  mask *= colorMask;

  if (invert > 0.0) mask = 1.0 - mask;

  float a = clamp(col.a * alpha + mask * opacity, 0.0, 1.0);

    gl_FragColor = vec4(col.rgb, a);
}