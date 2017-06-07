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
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform float u_Brightness;\n' +
    'uniform float u_Contrast;\n' +
    'uniform float u_Saturation;\n' +
    'uniform int u_Sharpen;\n' +
    'uniform vec2 u_InvSize;\n' +
    'uniform float u_Template[25];\n' +
    'uniform sampler2D u_Sampler;\n' +
    'varying vec2 v_TexCoord;\n' +
    
    'vec3 brightAndContrastAdjust(vec3 color) {\n' +
    '   float cv = u_Contrast / 255.0;  \n' +
    '   if (u_Contrast > 0.0 && u_Contrast < 255.0) {\n' +
    '     cv = 1.0 / (1.0 - cv) - 1.0;  \n' +
    '   }\n' +
    '   vec3 v = u_Contrast > 0.0 ? clamp (color + u_Brightness, 0.0, 255.0) : color.xyz;  \n' +
    '   v = clamp(v + ((v - 121.0) * cv + 0.5), 0.0, 255.0);  \n' +
    '   v = u_Contrast <= 0.0 ? clamp(v + u_Brightness, 0.0, 255.0) : v;  \n' +
    '   return v;\n' +
    '}\n' +
    
    
    'vec3 saturationAdjust(vec3 color, float saturation) {\n' +
    '   float rgbMax = max(max(color.x, color.y), color.z);\n' +
    '   float rgbMin = min(min(color.x, color.y), color.z);\n' +
    '   float delta = (rgbMax-rgbMin)/255.0;\n' +
    '   if (delta == 0.0) {\n' +
    '       return color;\n' +
    '   }\n' +
    
    '   float value = (rgbMax + rgbMin)/255.0;\n' +
    '   float l = value / 2.0;\n' +
    '   float s = 0.0;\n' +
    '   if (l < 0.5) {\n' +
    '       s = delta / value;\n' +
    '   } else {\n' +
    '       s = delta /(2.0 - value);\n' +
    '   }\n' +
  
    '   float alpha = 0.0; \n' +
    
    '   if (saturation >= 0.0) {\n' +
    '       if (saturation + s >= 1.0) {\n' +
    '           alpha = s;\n' +
    '       } else {\n' +
    '           alpha = 1.0 - saturation;\n' +
    '       }\n' +
    '       alpha = 1.0 /alpha - 1.0;\n' +
    '        color = color + (color - l * 255.0) * alpha;\n' +
    '   } else {\n' +
    '       alpha = saturation;\n' +
    '       color = (l * 255.0 + color - l * 255.0) * (1.0 + alpha);\n' +
    '   }\n' +
    '   color = clamp(color, 0.0, 255.0);\n' +
    '   return color;\n' +
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
    
    
    
    'void main() {\n' +
    
    '   vec3 color = texture2D(u_Sampler, v_TexCoord).xyz * 255.0;\n' + 
    '   color = brightAndContrastAdjust(color);  \n' +
    '   color = saturationAdjust(color, u_Saturation / 100.0);  \n' +
    '   color = sharpenAdjust(color);  \n' +
    
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

function onSaturationChanged(value)
{
    document.getElementById("saturation").innerHTML = value;
    gl.uniform1f(u_Saturation, value);
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

  u_Saturation = gl.getUniformLocation(gl.program, 'u_Saturation');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Saturation');
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
                    gl.uniform1f(u_Saturation, 0);
                    gl.uniform1i(u_Sharpen, 0);
                    gl.uniform2f(u_InvSize, 1 / image.width, 1/ image.height);
                    gl.uniform1fv(u_Template, [-1, -4, -7, -4, -1,   
                                                -4, -16, -26, -16, -4,   
                                                -7, -26, 505, -26, -7,  
                                                -4, -16, -26, -16, -4,   
                                                -1, -4, -7, -4, -1 ]);
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