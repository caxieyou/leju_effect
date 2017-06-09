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
    'precision mediump float;\n' +
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
    
    'vec3 brightAdjust(vec3 color) {\n' +
    '    vec2 c2 = vec2(185.0 - u_Brightness, 185.0 + u_Brightness); \n' +
    '    vec3 vt;\n' +
    '    float t= 0.0; \n' +
    '    for (int i = 1; i < 1024; i++){\n' +
    '        t += 0.0009765625;\n' +
    '        float a =  (c2.x * ((-3.0 * t * t + 3.0 * t) + 255.0 * (1.0-t) * (1.0-t) * (1.0-t)));\n' +
    '        if (abs(a - color.r) < 1.0) {\n' +
    '            vt.x = t;\n' +
    '        }\n' +
    '        if (abs(a - color.g) < 1.0) {\n' +
    '            vt.y = t;\n' +
    '        }\n' +
    '        if (abs(a - color.b) < 1.0) {\n' +
    '            vt.z = t;\n' +
    '        }\n' +
    '    }\n' +
    '    color = (c2.y * ((-3.0 * vt * vt + 3.0 * vt) + 255.0 * (1.0-vt) * (1.0-vt) * (1.0-vt)));\n' +
    '    return color; \n' +
    '}\n' +
    
    'vec3 contrastAdjust(vec3 color) {\n' +
    '   float cv = u_Contrast / 255.0;  \n' +
    '   if (u_Contrast > 0.0 && u_Contrast < 255.0) {\n' +
    '     cv = 1.0 / (1.0 - cv) - 1.0;  \n' +
    '   }\n' +
    '   color = clamp(color + ((color - 121.0) * cv + 0.5), 0.0, 255.0);  \n' +
    '   return color;\n' +
    '}\n' +
    

    'vecc lightnesAdjust(vec3 color) {\n' +
    '    float ratio = u_Lightness / 100.0; \n' + 
    '    if (u_Lightness >= 0.0) {\n' +
    '        color = color + (255.0 - color) * ratio;\n' +
    '    } else {\n' +
    '        color = color + color * ratio;\n' +
    '    }  \n' +
    '    return color;\n' +
    '}\n' +
    
    vecc hueAndsaturationAdjust(vec3 color) {

        if (intR < intG)  
            SwapRGB(intR, intG);  
        if (intR < intB)  
            SwapRGB(intR, intB);  
        if (intB > intG)  
            SwapRGB(intB, intG);  
      
        int delta = intR - intB;  
        if (!delta) return;  
      
        int entire = intR + intB;  
        int H, S, L = entire >> 1;  
        if (L < 128)  
            S = delta * 255 / entire;  
        else  
            S = delta * 255 / (510 - entire);  
        if (hValue)  
        {  
            if (intR == R)  
                H = (G - B) * 60 / delta;  
            else if (intR == G)  
                H = (B - R) * 60 / delta + 120;  
            else  
                H = (R - G) * 60 / delta + 240;  
            H += hValue;  
            if (H < 0) H += 360;  
            else if (H > 360) H -= 360;  
            int index = H / 60;  
            int extra = H % 60;  
            if (index & 1) extra = 60 - extra;  
            extra = (extra * 255 + 30) / 60;  
            intG = extra - (extra - 128) * (255 - S) / 255;  
            int Lum = L - 128;  
            if (Lum > 0)  
                intG += (((255 - intG) * Lum + 64) / 128);  
            else if (Lum < 0)  
                intG += (intG * Lum / 128);  
            CheckRGB(intG);  
            switch (index)  
            {  
                case 1:  
                    SwapRGB(intR, intG);  
                    break;  
                case 2:  
                    SwapRGB(intR, intB);  
                    SwapRGB(intG, intB);  
                    break;  
                case 3:  
                    SwapRGB(intR, intB);  
                    break;  
                case 4:  
                    SwapRGB(intR, intG);  
                    SwapRGB(intG, intB);  
                    break;  
                case 5:  
                    SwapRGB(intG, intB);  
                    break;  
            }  
        }  
        else  
        {  
            intR = R;  
            intG = G;  
            intB = B;  
        }  
        if (sValue)  
        {  
            if (sValue > 0)  
            {  
                sValue = sValue + S >= 255? S: 255 - sValue;  
                sValue = 65025 / sValue - 255;  
            }  
            intR += ((intR - L) * sValue / 255);  
            intG += ((intG - L) * sValue / 255);  
            intB += ((intB - L) * sValue / 255);  
        }  
        return color;
    }
    
    'vec3 hslAdjustment(color) { \n' +
    '    color = hueAndsaturationAdjust(color);\n' +
    '    color = lightnesAdjust(color);\n' +
    '    return color;\n' +
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
    //'   color = saturationAdjust(color, u_Saturation / 100.0);  \n' +
    '   color = hslAdjustment(color);  \n' +
    '   color = sharpenAdjust(color);  \n' +
    '   color = stageAdjust(color);  \n' +
    '   gl_FragColor = vec4(color / 255.0, 1.0);\n' +
    
    '}\n';
    
    
var gl;
var n;
var texture;
var u_Sampler;
var u_Brightness;
var u_Contrast;

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
    if(value) {
        gl.uniform1i(u_Sharpen, 1);
        updateCanvas();
    } else {
        gl.uniform1i(u_Sharpen, 0);
        updateCanvas();
        //do nothing
    }
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