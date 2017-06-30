//Webgl Shader 特效工具文件，GPU级别
//颜色减淡
/*
float blendColorDodge(in float base, in float blend) {
    return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
}

vec3 blendColorDodge(in vec3 base, in vec3 blend) {
    return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
}
*/
//模糊

//vertex shader部分，这部分很简单，没有任何的部分需要强调
//故整个绑成一体了
var v_shader_main =     'attribute vec4 a_Position;     \n' +
                        'attribute vec2 a_TexCoord;     \n' +
                        'varying vec2 v_TexCoord;       \n' +
                        
                        'void main() {                  \n' +
                        '    gl_Position = a_Position;  \n' +
                        '    v_TexCoord  = a_TexCoord;  \n' +
                        '}                              \n';

//fragment shader开头
var f_shader_header =   'precision highp float;         \n';                      
                        

var uniformArray = [    { name: "u_Brightness",             type: "float"},     //亮度调节变量
                        { name: "u_Contrast",               type: "float"},     //对比度调节变量
                        
                        { name: "u_Hue",                    type: "float"},     //色调调节变量
                        { name: "u_Saturation",             type: "float"},     //饱和度调节变量
                        { name: "u_Lightness",              type: "float"},     //明度调节变量
                        
                        { name: "u_Sharpen",                type: "float"},     //锐化
                       
                        
                        { name: "u_InputMinStage",          type: "float"},     //色阶输入最小值
                        { name: "u_InputMaxStage",          type: "float"},     //色阶输入最大值
                        { name: "u_Gamma",                  type: "float"},     //伽马矫正度
                        { name: "u_OutputMinStage",         type: "float"},     //色阶输出最小值
                        { name: "u_OutputMaxStage",         type: "float"},     //色阶输出最大值
                        
                        { name: "u_SampleImage",            type: "sampler2D"}, //原图纹理
                        
                        { name: "u_SamplerCurve",           type: "sampler2D"}, //曲线调节模板
                        
                        { name: "u_SamplerColorBalance",    type: "sampler2D"}, //色彩平衡模板
                        { name: "u_PreserveLuminosity",     type: "int"},       //是否保留明度
                        
                        { name: "u_Halo",                   type: "float"},      //光晕
                        { name: "u_InvSize",                type: "vec2"},       //图片宽高的反比
                        { name: "u_Scale",                  type: "float"}       //缩放比例
                    ];

//uniform 变量列表组合成的字符串
var f_uniform_list = "";

for (var i = 0; i < uniformArray.length; i++) {
    f_uniform_list += "uniform " + uniformArray[i].type + " " + uniformArray[i].name + "; \n";
}
                        
//varing 变量列表组合成的字符串
var varyingArray = [    { name: "v_TexCoord",             type: "vec2"}]        //纹理坐标

var f_varying_list = "";
for (var i = 0; i < varyingArray.length; i++) {
    f_varying_list += "varying " + varyingArray[i].type + " " + varyingArray[i].name + "; \n";
}

// shader 亮度调节函数
var f_func_brightAdjust =   'vec3 brightAdjust(vec3 color) {        \n' +
                            '    color += u_Brightness;             \n' +
                            '    return clamp(color, 0.0, 255.0);   \n' +
                            '}                                      \n';

// shader 对比度调节函数
var f_func_contrastAdjust = 'vec3 contrastAdjust(vec3 color) {                                  \n' +
                            '   float cv = u_Contrast / 255.0;                                  \n' +
                            '   if (u_Contrast > 0.0 && u_Contrast < 255.0) {                   \n' +
                            '       cv = 1.0 / (1.0 - cv) - 1.0;                                \n' +
                            '   }                                                               \n' +
                            '   return clamp(color + ((color - 121.0) * cv + 0.5), 0.0, 255.0); \n' +
                            '}\n';

// 颜色空间函数RGB转HSL函数
var f_func_RGBToHSL =       'vec3 RGBToHSL(vec3 color) {                                                \n' +
                            '   color = color / 255.0;                                                  \n' +
                            '   vec3 hsl;                                                               \n' +
                              
                            '   float fmin = min(min(color.r, color.g), color.b);                       \n' +
                            '   float fmax = max(max(color.r, color.g), color.b);                       \n' +
                            '   float delta = fmax - fmin;                                              \n' +
                            '   hsl.z = (fmax + fmin) / 2.0;                                            \n' +
                            '   if (delta == 0.0) {                                                     \n' +
                            '       hsl.x = 0.0;                                                        \n' +
                            '       hsl.y = 0.0;                                                        \n' +
                            '   } else {                                                                \n' +
                            '       if (hsl.z < 0.5)                                                    \n' +
                            '           hsl.y = delta / (fmax + fmin);                                  \n' +
                            '       else                                                                \n' +
                            '           hsl.y = delta / (2.0 - fmax - fmin);                            \n' +
                                
                            '       float deltaR = (((fmax - color.r) / 6.0) + (delta / 2.0)) / delta;  \n' +
                            '       float deltaG = (((fmax - color.g) / 6.0) + (delta / 2.0)) / delta;  \n' +
                            '       float deltaB = (((fmax - color.b) / 6.0) + (delta / 2.0)) / delta;  \n' +

                            '       if (color.r == fmax )                                               \n' +
                            '           hsl.x = deltaB - deltaG;                                        \n' +
                            '       else if (color.g == fmax)                                           \n' +
                            '           hsl.x = (1.0 / 3.0) + deltaR - deltaB;                          \n' +
                            '       else if (color.b == fmax)                                           \n' +
                            '           hsl.x = (2.0 / 3.0) + deltaG - deltaR;                          \n' +

                            '       if (hsl.x < 0.0)                                                    \n' +
                            '           hsl.x += 1.0;                                                   \n' +
                            '       else if (hsl.x > 1.0)                                               \n' +
                            '           hsl.x -= 1.0;                                                   \n' +
                            '  }                                                                        \n' +
                            '   return clamp(hsl,0.0,1.0);                                              \n' +
                            '}                                                                          \n';
                            
// 颜色空间函数Hue转RGB
var f_func_HueToRGB =       'float HueToRGB(float f1, float f2, float hue)                              \n' +
                            '{                                                                          \n' +
                            '   if (hue < 0.0)                                                          \n' +
                            '       hue += 1.0;                                                         \n' +
                            '   else if (hue > 1.0)                                                     \n' +
                            '       hue -= 1.0;                                                         \n' +
                            '   float res;                                                              \n' +
                            '   if ((6.0 * hue) < 1.0)                                                  \n' +
                            '       res = f1 + (f2 - f1) * 6.0 * hue;                                   \n' +
                            '   else if ((2.0 * hue) < 1.0)                                             \n' +
                            '       res = f2;                                                           \n' +
                            '   else if ((3.0 * hue) < 2.0)                                             \n' +
                            '       res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;                   \n' +
                            '   else                                                                    \n' +
                            '       res = f1;                                                           \n' +
                            '  return res;                                                              \n' +
                            '}                                                                          \n';


// 颜色空间函数HSL转RGB
var f_func_HSLToRGB =       'vec3 HSLToRGB(vec3 hsl) {                                                  \n' +
                            '   vec3 rgb;                                                               \n' +
                            '   if (hsl.y == 0.0)                                                       \n' +
                            '       rgb = vec3(hsl.z);                                                  \n' +
                            '   else {                                                                  \n' +
                            '       float f2;                                                           \n' +
                            '       if (hsl.z < 0.5)                                                    \n' +
                            '           f2 = hsl.z * (1.0 + hsl.y);                                     \n' +
                            '       else                                                                \n' +
                            '           f2 = (hsl.z + hsl.y) - (hsl.y * hsl.z);                         \n' +
                            '       float f1 = 2.0 * hsl.z - f2;                                        \n' +
                            '       rgb.r = HueToRGB(f1, f2, hsl.x + (1.0/3.0));                        \n' +
                            '       rgb.g = HueToRGB(f1, f2, hsl.x);                                    \n' +
                            '       rgb.b = HueToRGB(f1, f2, hsl.x - (1.0/3.0));                        \n' +
                            '   }                                                                       \n' +
                            '   return rgb* 255.0;                                                      \n' +
                            '}                                                                          \n';
// 色相饱和度调节函数
var f_func_hslAdjus =       'vec3 hslAdjust(vec3 color) {                                                           \n' +
                            '    vec3 hsl_param = vec3(u_Hue / 180.0, u_Saturation / 100.0, u_Lightness / 100.0);   \n' +
                            '    vec3 hsl = RGBToHSL(color);                                                        \n' +
                            '    hsl.r += hsl_param.r * hsl.r;                                                      \n' +
                            '    hsl.g += hsl_param.g * hsl.g;                                                      \n' +
                            '    hsl.b += hsl_param.b * hsl.b;                                                      \n' +
                            '    color = HSLToRGB(hsl);                                                             \n' +
                            '    return clamp(color, 0.0, 255.0);                                                   \n' +
                            '}                                                                                      \n';
                            
// 锐化开启关闭函数
var f_func_sharpenAdjust =  'vec3 sharpenAdjust(vec3 color) {                                                                                         \n' +
                            '        vec3 sum = color * 5.0;                                                                                          \n' +
                            '        sum -= _adjustColor(v_TexCoord + vec2( 1.0 * u_InvSize.x,  0.0 * u_InvSize.y)) * 255.0;          \n' +
                            '        sum -= _adjustColor(v_TexCoord + vec2(-1.0 * u_InvSize.x,  0.0 * u_InvSize.y)) * 255.0;          \n' +
                            '        sum -= _adjustColor(v_TexCoord + vec2( 0.0 * u_InvSize.x,  1.0 * u_InvSize.y)) * 255.0;          \n' +
                            '        sum -= _adjustColor(v_TexCoord + vec2( 0.0 * u_InvSize.x, -1.0 * u_InvSize.y)) * 255.0;          \n' +
                            '        return mix(color, sum, u_Sharpen);                                                                               \n' +
                            '}                                                                                                                        \n';

// 归一化函数
var f_func_myNormalize =    'vec3 myNormalize(vec3 val, float dmin, float dmax, float smin, float smax) {   \n' +
                            '    float sdist = sqrt((smin - smax) * (smin - smax));                         \n' +
                            '    float ddist = sqrt((dmin - dmax) * (dmin - dmax));                         \n' +
                            '    float ratio = ddist / sdist;                                               \n' +
                            '    val = clamp(val, smin, smax);                                              \n' +
                            '    return dmin + (val-smin) * ratio;                                          \n' +
                            '}                                                                              \n';

// 色阶调节函数
var f_func_stageAdjust =    'vec3 stageAdjust(vec3 color) {                                                                                                             \n' +
                            '   return color = myNormalize(255.0 * pow(myNormalize(color, 0.0, 255.0, u_InputMinStage, u_InputMaxStage) / 255.0, vec3(1.0 / u_Gamma)),  \n' +
                            '                              u_OutputMinStage, u_OutputMaxStage, 0.0, 255.0);                                                             \n' +
                            '}                                                                                                                                          \n';
    
// 曲线映调节函数
var f_func_applyCurve =     'vec3 applyCurve(vec3 color, sampler2D texSample) {                                     \n' +
                                
                            '    color.r = texture2D(texSample, vec2(color.r / 255.0, color.r / 255.0)).r * 255.0;  \n' +
                            '    color.g = texture2D(texSample, vec2(color.g / 255.0, color.g / 255.0)).g * 255.0;  \n' +
                            '    color.b = texture2D(texSample, vec2(color.b / 255.0, color.b / 255.0)).b * 255.0;  \n' +
                            '    return color;                                                                      \n' +
                            '}                                                                                      \n';
    
// 色彩平衡函数
var f_func_colorBalanceAdjust =     'vec3 colorBalanceAdjust(vec3 color, sampler2D texSample){  \n' +
                                    '    if (u_PreserveLuminosity > 0) {                        \n' +
                                    '        vec3 colorMap = applyCurve(color, texSample);      \n' +
                                    '        vec3 colorMapHSL = RGBToHSL(colorMap);             \n' +
                                    '        vec3 colorHSL    = RGBToHSL(color);                \n' +
                                    '        colorMapHSL.b    =  colorHSL.b;                    \n' +
                                    '        return HSLToRGB(colorMapHSL);                      \n' +
                                    '    } else{                                                \n' +
                                    '        return applyCurve(color, texSample);               \n' +
                                    '    }                                                      \n' +
                                    '}                                                          \n';
// 光晕函数
var f_func_haloAdjust = 'float linstep(float minV, float maxV, float v) {                                                                           \n' +
                            'return clamp((v-minV) / (maxV - minV), 0.0, 1.0);                                                                      \n' +
                        '}                                                                                                                          \n' +

                        'float getEffectCol( vec3 centerC ) {                                                                                       \n' +
                            'float gray = dot(centerC, vec3(0.299, 0.587, 0.114));                                                                  \n' +
                        
                        '   return linstep(1.0 / 2., 1.0 * 1.3, gray);                                                                              \n' +
                        '}                                                                                                                          \n' +

                        'vec3 haloAdjust(vec3 color) {                                                                                              \n' +
                        '   color /= 255.0;                                                                                                         \n' +
                        '   vec2 pos = v_TexCoord;                                                                                                  \n' +
                        '   float count = 0.0;                                                                                                      \n' +
                        '   float step = 4.0;                                                                                                       \n' +
                        '   float Ec = 0.0;                                                                                                         \n' +
                        '   for (int i = -8; i < 8; i++) {                                                                                          \n' +
                        '       for (int j = -8; j < 8; j++) {                                                                                      \n' +
                        '           float s = getEffectCol(_adjustColor(pos + vec2(float(i)*step, float(j)*step) *u_InvSize));   \n' +
                        '           Ec += s;                                                                                                        \n' +
                        '           count += 1.0;                                                                                                   \n' +
                        '       }                                                                                                                   \n' +
                        '   }                                                                                                                       \n' +
                        '   Ec /= count;                                                                                                            \n' +
                        '   return clamp((color + ( 1.0 - color ) * Ec * u_Halo) * 255.0, 0.0, 255.0);                                              \n' +
                        '}                                                                                                                          \n';
//u_Scale 是canvas和实际图片的比例，做一个均值模糊，然后做缩放的时候就不会花边了
var f_func_adjustColor =   'vec3 _adjustColor(vec2 coord) {                                                                                         \n' +
                           '    float scale = u_Scale;                                                                                              \n' +
                           '    vec3 color = vec3(0.0);                                                                                             \n' +
                            
                           '    if (scale < 0.3){                                                                                                   \n' +
                           '        for(int i = -2; i < 3; i++)                                                                                     \n' +
                           '            for(int j = -2; j < 3; j++)                                                                                 \n' +
                           '            {                                                                                                           \n' +
                           '                color += texture2D(u_SampleImage, coord + vec2(float(i) * u_InvSize.x,  float(j) * u_InvSize.y)).xyz;   \n' +
                           '            }                                                                                                           \n' +
                           '        color /= 25.0;                                                                                                  \n' +
                           '    } else if (scale < 0.5) {                                                                                           \n' +
                           '        for(int i = -1; i < 2; i++)                                                                                     \n' +
                           '            for(int j = -1; j < 2; j++)                                                                                 \n' +
                           '            {                                                                                                           \n' +
                           '                color += texture2D(u_SampleImage, coord + vec2(float(i) * u_InvSize.x,  float(j) * u_InvSize.y)).xyz;   \n' +
                           '            }                                                                                                           \n' +
                           '        color /= 5.0;                                                                                                   \n' +
                           '    } else {                                                                                                            \n' +
                           '        color = texture2D(u_SampleImage, coord).xyz;                                                                    \n' +
                           '    }                                                                                                                   \n' +
                           '    return color;                                                                                                       \n' +
                           '}                                                                                                                       \n';
                        
                        
var f_func_Array = [f_func_adjustColor,
                    f_func_brightAdjust, 
                    f_func_contrastAdjust, 
                    f_func_RGBToHSL, 
                    f_func_HueToRGB, 
                    f_func_HSLToRGB, 
                    f_func_hslAdjus, 
                    f_func_sharpenAdjust, 
                    f_func_myNormalize,
                    f_func_stageAdjust,
                    f_func_applyCurve,
                    f_func_colorBalanceAdjust,
                    f_func_haloAdjust];

var f_func_list = "";
for (var i = 0; i < f_func_Array.length; i++) {
    f_func_list += f_func_Array[i];
}

var f_func_main =   'void main() {                                                      \n' +
                    '  vec3 color = _adjustColor(v_TexCoord) * 255.0;                   \n' +
                    '       color = sharpenAdjust(color);                               \n' +
                    '       color = brightAdjust(color);                                \n' +
                    '       color = contrastAdjust(color);                              \n' +
                    '       color = hslAdjust(color);                                   \n' +
                    '       color = stageAdjust(color);                                 \n' +
                    '       color = applyCurve(color, u_SamplerCurve);                  \n' +
                    '       color = colorBalanceAdjust(color, u_SamplerColorBalance);   \n' +
                    '       color = haloAdjust(color);                                  \n' +
                    '   gl_FragColor = vec4(color / 255.0, 1.0);                        \n' +
                    '}                                                                  \n';

