#define GLSLIFY 1
varying vec4 coord;

uniform sampler2D texture;
uniform vec2 white_balance;

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

vec3 rgb2xyz(in vec3 rgb, in vec3 whiteRGB, in vec3 whiteXYZ) {
  vec3 s = whiteRGB * matAdapt;
  vec3 d = whiteXYZ * matAdapt;
    vec3 xyz;

    xyz = rgb * matRGBtoXYZ;

    // adaption
    xyz = (xyz * matAdapt) * (d/s) * matAdaptInv;

    return xyz;
}

vec3 xyz2rgb(in vec3 xyz, in vec3 whiteRGB, in vec3 whiteXYZ) {
  vec3 s = whiteRGB * matAdapt;
  vec3 d = whiteXYZ * matAdapt;
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

float luma(in vec3 color){
    return dot(color, vec3(0.242655, 0.755158, 0.002187));
}

vec3 invCompand(in vec3 companded) {
  return vec3(
    (companded.r <= 0.04045) ? (companded.r / 12.92) : pow((companded.r + 0.055) / 1.055, 2.4),
    (companded.g <= 0.04045) ? (companded.g / 12.92) : pow((companded.g + 0.055) / 1.055, 2.4),
    (companded.b <= 0.04045) ? (companded.b / 12.92) : pow((companded.b + 0.055) / 1.055, 2.4)
  );
}

float invCompand(in float companded) {
  return (companded <= 0.04045) ? (companded / 12.92) : pow((companded + 0.055) / 1.055, 2.4);
}

vec3 compand(in vec3 linear) {
  return vec3(
    (linear.r <= 0.0031308) ? (linear.r * 12.92) : (1.055 * pow(linear.r, 1.0 / 2.4) - 0.055),
    (linear.g <= 0.0031308) ? (linear.g * 12.92) : (1.055 * pow(linear.g, 1.0 / 2.4) - 0.055),
    (linear.b <= 0.0031308) ? (linear.b * 12.92) : (1.055 * pow(linear.b, 1.0 / 2.4) - 0.055)
  );
}

float Lum(vec3 c){
//  vec3 coeff = vec3(0.299, 0.587, 0.114);
//    return dot(c, coeff * matRGBtoROMM);
    return dot(c, vec3(0.242655, 0.755158, 0.002187));
//    return 0.299*c.r + 0.587*c.g + 0.114*c.b;
}

vec3 ClipColor(vec3 c){
    float l = Lum(c);
    float n = min(min(c.r, c.g), c.b);
    float x = max(max(c.r, c.g), c.b);

    if (n < 0.0) c = (c-l)*l / (l-n) + l;
    if (x > 1.0) c = (c-l) * (1.0-l) / (x-l) + l;

    return c;
}

vec3 SetLum(vec3 c, float l){
    float d = l - Lum(c);

    c.r = c.r + d;
    c.g = c.g + d;
    c.b = c.b + d;

    return c;
//    return ClipColor(c);
}
const vec3 CCT2K = vec3(1.274335, 1.0, 0.145233);
const vec3 CCT4K = vec3(1.009802, 1.0, 0.644496);
const vec3 CCT20K = vec3(0.995451, 1.0, 1.886109);

void main() {
  lowp vec4 col = texture2D(texture, coord.xy);
    vec3 res = col.rgb;

//    float mask = col.a;

  res = invCompand(res);

    float lum = Lum(res * matRGBtoROMM);

  vec3 xyz = rgb2xyz(res, D65, D50);
  vec3 lab = xyz2lab(xyz, D50);
  float sat = sqrt(lab.y * lab.y + lab.z * lab.z) / 100.0;
  float mask = invCompand(lab.x / 100.0 * (1.0 - sat));

  vec3 whiteRGB = hsv2rgb(vec3(white_balance.x, white_balance.y, 1.0));

//  vec3 whitePointIn = rgb2xyz(whiteRGB, D65, D65);
  vec3 whitePointOut = rgb2xyz(whiteRGB, D65, D50);
  whitePointOut.y = 1.0;

  res = xyz2lab(xyz, mix(whitePointOut, CCT20K, 1.0));
  res = xyz2rgb(lab2xyz(res, D50), D65, D50);

//  res = rgb2xyz(res, mix(whitePointIn, D65, 1.0), mix(whitePointOut, D50, 0.0));

//  vec3 ilab = xyz2lab(res, D50);
//  ilab.x = lab.x;
//  res = lab2xyz(ilab, D50);
//  res = xyz2rgb(res, D65, mix(whitePointOut, D50, 1.0));

//  res += lum * 0.5;
  res = clamp(res, 0.0, 1.0);

//  res = SetLum(res * matRGBtoROMM, clamp(lum * 1.0, 0.0, 1.0));
//  res = res * matROMMtoRGB;

//  res = vec3(lum) * matROMMtoRGB;

//  res = vec3(lum * (1.0 - sat));

  res = compand(res);

    gl_FragColor = vec4(res, 1.0);

}