// TexturedQuad.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '  v_TexCoord = a_TexCoord;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    //'#ifdef GL_ES\n' +
    'precision highp float;\n' +
    //'#endif\n' +
    'uniform float u_Brightness;\n' +
    'uniform float u_Contrast;\n' +
    'uniform float u_Hue;\n' +
    'uniform float u_Saturation;\n' +
    'uniform float u_Lightness;\n' +
    'uniform int u_Sharpen;\n' +
    'uniform vec2 u_InvSize;\n' +
    'uniform float u_Template[25];\n' +
    'uniform float u_InputMinStage;\n' +
    'uniform float u_InputMaxStage;\n' +
    'uniform float u_Gamma;\n' +
    'uniform float u_OutputMinStage;\n' +
    'uniform float u_OutputMaxStage;\n' +
    
    'uniform sampler2D u_Sampler;\n' +
    'varying vec2 v_TexCoord;\n' +
    
    'bool isEqual(float a , float b) {\n' +
    '    return abs(a- b) < 0.00001;\n' +
    '}\n' +
    
    'vec3 brightAdjust(vec3 color) {\n' +
    '    color += u_Brightness; \n ' +
    '    return clamp(color, 0.0, 255.0);\n' +
    '}\n' +
    
    'vec3 contrastAdjust(vec3 color) {\n' +
    '   float cv = u_Contrast / 255.0;  \n' +
    '   if (u_Contrast > 0.0 && u_Contrast < 255.0) {\n' +
    '     cv = 1.0 / (1.0 - cv) - 1.0;  \n' +
    '   }\n' +
    '   return clamp(color + ((color - 121.0) * cv + 0.5), 0.0, 255.0);  \n' +
    '}\n' +
    
    'vec3 RGBToHSL(vec3 color) \n' +
    '{\n' +
    '  color = color / 255.0;\n' +
    '  vec3 hsl; \n' +
      
    '  float fmin = min(min(color.r, color.g), color.b);    \n' +
    '  float fmax = max(max(color.r, color.g), color.b);    \n' +
    '  float delta = fmax - fmin;             \n' +

    '  hsl.z = (fmax + fmin) / 2.0; \n' +

    '  if (delta == 0.0)   \n' +
    '  {\n' +
    '    hsl.x = 0.0;  \n' +
    '    hsl.y = 0.0;  \n' +
    '  }\n' +
    '  else                                    \n' +
    '  {\n' +
    '    if (hsl.z < 0.5)\n' +
    '      hsl.y = delta / (fmax + fmin); \n' +
    '    else \n' +
    '      hsl.y = delta / (2.0 - fmax - fmin); \n' +
        
    '    float deltaR = (((fmax - color.r) / 6.0) + (delta / 2.0)) / delta;\n' +
    '    float deltaG = (((fmax - color.g) / 6.0) + (delta / 2.0)) / delta;\n' +
    '    float deltaB = (((fmax - color.b) / 6.0) + (delta / 2.0)) / delta;\n' +

    '    if (color.r == fmax )\n' +
    '      hsl.x = deltaB - deltaG; \n' +
    '    else if (color.g == fmax)\n' +
    '      hsl.x = (1.0 / 3.0) + deltaR - deltaB; \n' +
    '    else if (color.b == fmax)\n' +
    '      hsl.x = (2.0 / 3.0) + deltaG - deltaR; \n' +

    '    if (hsl.x < 0.0)\n' +
    '      hsl.x += 1.0; \n' +
    '    else if (hsl.x > 1.0)\n' +
    '      hsl.x -= 1.0; \n' +
    '  }\n' +

    '  return clamp(hsl,0.0,1.0);\n' +
    '}\n' +
    
    'float HueToRGB(float f1, float f2, float hue)\n' +
    '{\n' +
    '  if (hue < 0.0)\n' +
    '    hue += 1.0;\n' +
    '  else if (hue > 1.0)\n' +
    '    hue -= 1.0;\n' +
    '  float res;\n' +
    '  if ((6.0 * hue) < 1.0)\n' +
    '    res = f1 + (f2 - f1) * 6.0 * hue;\n' +
    '  else if ((2.0 * hue) < 1.0)\n' +
    '    res = f2;\n' +
    '  else if ((3.0 * hue) < 2.0)\n' +
    '    res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;\n' +
    '  else\n' +
    '    res = f1;\n' +
    '  return res;\n' +
    '}\n' +

    'vec3 HSLToRGB(vec3 hsl)\n' +
    '{\n' +
    '  vec3 rgb;\n' +
      
    '  if (hsl.y == 0.0)\n' +
    '    rgb = vec3(hsl.z); \n' +
    '  else\n' +
    '  {\n' +
    '    float f2;\n' +
        
    '    if (hsl.z < 0.5)\n' +
    '      f2 = hsl.z * (1.0 + hsl.y);\n' +
    '    else\n' +
    '      f2 = (hsl.z + hsl.y) - (hsl.y * hsl.z);\n' +
          
    '    float f1 = 2.0 * hsl.z - f2;\n' +
        
    '    rgb.r = HueToRGB(f1, f2, hsl.x + (1.0/3.0));\n' +
    '    rgb.g = HueToRGB(f1, f2, hsl.x);\n' +
    '    rgb.b = HueToRGB(f1, f2, hsl.x - (1.0/3.0));\n' +
    '  }\n' +
      
    '  return rgb;\n' +
    '}\n' +
    
    'vec3 hslAdjustment(vec3 color) { \n' +
    '    vec3 hsl_param = vec3(u_Hue / 180.0, u_Saturation / 100.0, u_Lightness / 100.0); \n' +
    '    vec3 hsl = RGBToHSL(color);\n' +
    '    hsl.r += hsl_param.r * hsl.r;\n' +
    '    hsl.g += hsl_param.g * hsl.g;\n' +
    '    hsl.b += hsl_param.b * hsl.b;\n' +
    '    color = HSLToRGB(hsl) * 255.0;\n' +
    '    return clamp(color, 0.0, 255.0);\n' +
    '}\n' +
    
    'vec3 sharpenAdjust(vec3 color) {\n' +
    '    if(u_Sharpen <= 0) {\n' +
    '        return color;\n' +
    '    } else {\n' +
    '        color = vec3(0.0);  \n' +
    
    '        color += texture2D(u_Sampler, v_TexCoord + vec2(-2.0 * u_InvSize.x, -2.0 * u_InvSize.y)).xyz * 255.0 * u_Template[0] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2(-1.0 * u_InvSize.x, -2.0 * u_InvSize.y)).xyz * 255.0 * u_Template[1] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2(-0.0 * u_InvSize.x, -2.0 * u_InvSize.y)).xyz * 255.0 * u_Template[2] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 1.0 * u_InvSize.x, -2.0 * u_InvSize.y)).xyz * 255.0 * u_Template[3] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 2.0 * u_InvSize.x, -2.0 * u_InvSize.y)).xyz * 255.0 * u_Template[4] ;  \n' +
    
    '        color += texture2D(u_Sampler, v_TexCoord + vec2(-2.0 * u_InvSize.x, -1.0 * u_InvSize.y)).xyz * 255.0 * u_Template[5] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2(-1.0 * u_InvSize.x, -1.0 * u_InvSize.y)).xyz * 255.0 * u_Template[6] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 0.0 * u_InvSize.x, -1.0 * u_InvSize.y)).xyz * 255.0 * u_Template[7] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 1.0 * u_InvSize.x, -1.0 * u_InvSize.y)).xyz * 255.0 * u_Template[8] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 2.0 * u_InvSize.x, -1.0 * u_InvSize.y)).xyz * 255.0 * u_Template[9] ;  \n' +
    
    '        color += texture2D(u_Sampler, v_TexCoord + vec2(-2.0 * u_InvSize.x,  0.0 * u_InvSize.y)).xyz * 255.0 * u_Template[10] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2(-1.0 * u_InvSize.x,  0.0 * u_InvSize.y)).xyz * 255.0 * u_Template[11] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 0.0 * u_InvSize.x,  0.0 * u_InvSize.y)).xyz * 255.0 * u_Template[12] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 1.0 * u_InvSize.x,  0.0 * u_InvSize.y)).xyz * 255.0 * u_Template[13] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 2.0 * u_InvSize.x,  0.0 * u_InvSize.y)).xyz * 255.0 * u_Template[14] ;  \n' +
    
    '        color += texture2D(u_Sampler, v_TexCoord + vec2(-2.0 * u_InvSize.x,  1.0 * u_InvSize.y)).xyz * 255.0 * u_Template[15] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2(-1.0 * u_InvSize.x,  1.0 * u_InvSize.y)).xyz * 255.0 * u_Template[16] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 0.0 * u_InvSize.x,  1.0 * u_InvSize.y)).xyz * 255.0 * u_Template[17] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 1.0 * u_InvSize.x,  1.0 * u_InvSize.y)).xyz * 255.0 * u_Template[18] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 2.0 * u_InvSize.x,  1.0 * u_InvSize.y)).xyz * 255.0 * u_Template[19] ;  \n' +
    
    '        color += texture2D(u_Sampler, v_TexCoord + vec2(-2.0 * u_InvSize.x,  2.0 * u_InvSize.y)).xyz * 255.0 * u_Template[20] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2(-1.0 * u_InvSize.x,  2.0 * u_InvSize.y)).xyz * 255.0 * u_Template[21] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 0.0 * u_InvSize.x,  2.0 * u_InvSize.y)).xyz * 255.0 * u_Template[22] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 1.0 * u_InvSize.x,  2.0 * u_InvSize.y)).xyz * 255.0 * u_Template[23] ;  \n' +
    '        color += texture2D(u_Sampler, v_TexCoord + vec2( 2.0 * u_InvSize.x,  2.0 * u_InvSize.y)).xyz * 255.0 * u_Template[24] ;  \n' +
    
    '        color /= 273.0;  \n' +
    '        clamp(color, 0.0, 255.0);\n' +
    
    '        return color;\n' +
    '    }\n' +
    '}\n' +
    
    'vec3 myNormalize(vec3 val, float dmin, float dmax, float smin, float smax) {\n' +
    '    float sdist = sqrt((smin - smax) * (smin - smax));\n' +
    '    float ddist = sqrt((dmin - dmax) * (dmin - dmax));\n' +
    '    float ratio = ddist / sdist; \n' +
    '    val = clamp(val, smin, smax);\n' +
    '    return dmin + (val-smin) * ratio;\n' +
    '}\n' +
    
    'vec3 stageAdjust(vec3 color) {\n' +
    '   return color = myNormalize(255.0 * pow(myNormalize(color, 0.0, 255.0, u_InputMinStage, u_InputMaxStage) / 255.0, vec3(1.0 / u_Gamma)),u_OutputMinStage, u_OutputMaxStage, 0.0, 255.0);\n' +
    '}\n' +
    
    'void main() {\n' +
    '   vec3 color = texture2D(u_Sampler, v_TexCoord).xyz * 255.0;\n' + 
    
    '   color = brightAdjust(color);  \n' +
    '   color = contrastAdjust(color);  \n' +
    '   color = hslAdjustment(color);  \n' +
    '   color = stageAdjust(color);  \n' +
    '   color = sharpenAdjust(color);  \n' +
    '   gl_FragColor = vec4(color / 255.0, 1.0);\n' +
    
    '}\n';
    

var gl;
var n;
var texture;
var u_Sampler;
var u_Brightness;
var u_Contrast;
var u_Hue;
var u_Saturation;
var u_Lightness;
var u_InputMinStage;
var u_InputMaxStage;
var u_Gamma;
var u_OutputMinStage;
var u_OutputMaxStage;
var u_Sharpen;
var u_InvSize;
var u_Template;

function onBrightnessChanged(value)
{
    document.getElementById("brightness").innerHTML = value;
    gl.uniform1f(u_Brightness, value);
    updateCanvas();
}

function onContrastChanged(value)
{
    document.getElementById("contrast").innerHTML = value;
    gl.uniform1f(u_Contrast, value);
    updateCanvas();
}

function onHueChanged(value)
{
    document.getElementById("hue").innerHTML = value;
    gl.uniform1f(u_Hue, value);
    updateCanvas();
}

function onSaturationChanged(value)
{
    document.getElementById("saturation").innerHTML = value;
    gl.uniform1f(u_Saturation, value);
    updateCanvas();
}

function onLightnessChanged(value)
{
    document.getElementById("lightness").innerHTML = value;
    gl.uniform1f(u_Lightness, value);
    updateCanvas();
}

function onInputStageMinChanged(value)
{
    document.getElementById("inputMinStage").innerHTML = value;
    gl.uniform1f(u_InputMinStage, value);
    updateCanvas();
}

function onInputStageMaxChanged(value)
{
    document.getElementById("inputMaxStage").innerHTML = value;
    gl.uniform1f(u_InputMaxStage, value);
    updateCanvas();
}

function onGammaChanged(value)
{
    document.getElementById("gamma").innerHTML = value;
    gl.uniform1f(u_Gamma, value);
    updateCanvas();
}

function onOutputStageMinChanged(value)
{
    document.getElementById("outputMinStage").innerHTML = value;
    gl.uniform1f(u_OutputMinStage, value);
    updateCanvas();
}

function onOutputStageMaxChanged(value)
{
    document.getElementById("outputMaxStage").innerHTML = value;
    gl.uniform1f(u_OutputMaxStage, value);
    updateCanvas();
}
    
function onSharpenChecked(value)
{
    gl.uniform1i(u_Sharpen, value ? 1: 0);
    updateCanvas();
}

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Set the vertex information
    initVertexBuffers();
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Set texture
    if (!initTextures()) {
        console.log('Failed to intialize the texture.');
        return;
    }
}

function initVertexBuffers() {
  var verticesTexCoords = new Float32Array([
    // Vertex coordinates, texture coordinate
    -1.0,  1.0,   0.0, 1.0,
    -1.0, -1.0,   0.0, 0.0,
     1.0,  1.0,   1.0, 1.0,
     1.0, -1.0,   1.0, 0.0,
  ]);
  n = 4; // The number of vertices

  // Create the buffer object
  var vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_TexCoord
  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }
  // Assign the buffer object to a_TexCoord variable
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object
}

function initTextures() {
  texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler
  u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }
  
  u_Brightness = gl.getUniformLocation(gl.program, 'u_Brightness');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Brightness');
    return false;
  }
  
  u_Contrast = gl.getUniformLocation(gl.program, 'u_Contrast');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Contrast');
    return false;
  }

  u_Hue = gl.getUniformLocation(gl.program, 'u_Hue');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Hue');
    return false;
  }
  
  u_Saturation = gl.getUniformLocation(gl.program, 'u_Saturation');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Saturation');
    return false;
  }
  
  u_Lightness = gl.getUniformLocation(gl.program, 'u_Lightness');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Lightness');
    return false;
  }

  u_Sharpen = gl.getUniformLocation(gl.program, 'u_Sharpen');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sharpen');
    return false;
  }
  
  u_InvSize = gl.getUniformLocation(gl.program, 'u_InvSize');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_InvSize');
    return false;
  }
  
  u_Template = gl.getUniformLocation(gl.program, 'u_Template');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Template');
    return false;
  }

  u_InputMinStage = gl.getUniformLocation(gl.program, 'u_InputMinStage');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_InputMinStage');
    return false;
  }

  u_InputMaxStage = gl.getUniformLocation(gl.program, 'u_InputMaxStage');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_InputMaxStage');
    return false;
  }

  u_Gamma = gl.getUniformLocation(gl.program, 'u_Gamma');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Gamma');
    return false;
  }

  u_OutputMinStage = gl.getUniformLocation(gl.program, 'u_OutputMinStage');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_OutputMinStage');
    return false;
  }

  u_OutputMaxStage = gl.getUniformLocation(gl.program, 'u_OutputMaxStage');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_OutputMaxStage');
    return false;
  }  
  
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ 
  
                    //Do the preprocess work
                    var canvas = document.createElement('canvas');
                    canvas.width = image.width;
                    canvas.height = image.height;
                    canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
                    
                    var pixelData = canvas.getContext('2d').getImageData(0, 0, image.width, image.height).data;
                    // do the image analysis
                    
                    
                    
                    var data = new Uint8Array(image.width * image.height * 3);
                    
                    for (var i = 0; i < image.width * image.height; i++) {
                        data[i*3] = 0;
                        data[i*3 + 1] = 0;
                        data[i*3 + 2] = 255;
                        //data[i*4 + 3] = 255;
                    }
                    
                    
                    
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
                    // Enable texture unit0
                    gl.activeTexture(gl.TEXTURE0);
                    // Bind the texture object to the target
                    gl.bindTexture(gl.TEXTURE_2D, texture);

                    // Set the texture parameters
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    // Set the texture image
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
                    
                    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
                      
                    // Set the texture unit 0 to the sampler
                    gl.uniform1i(u_Sampler, 0);
                    gl.uniform1f(u_Brightness, 0);
                    gl.uniform1f(u_Contrast, 0);
                    gl.uniform1f(u_Hue, 0);
                    gl.uniform1f(u_Saturation, 0);
                    gl.uniform1f(u_Lightness, 0);
                    gl.uniform1i(u_Sharpen, 0);
                    gl.uniform2f(u_InvSize, 1 / image.width, 1/ image.height);
                    gl.uniform1fv(u_Template, [-1, -4, -7, -4, -1,   
                                                -4, -16, -26, -16, -4,   
                                                -7, -26, 505, -26, -7,  
                                                -4, -16, -26, -16, -4,   
                                                -1, -4, -7, -4, -1 ]);
                                                
                    gl.uniform1f(u_InputMinStage, 0);
                    gl.uniform1f(u_InputMaxStage, 255);
                    gl.uniform1f(u_Gamma, 1);
                    gl.uniform1f(u_OutputMinStage, 0);
                    gl.uniform1f(u_OutputMaxStage, 255);
                    
                    updateCanvas(); 
                 };
  // Tell the browser to load an image
  image.src = '../resources/view.jpg';

  return true;
}

function updateCanvas() {
  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}