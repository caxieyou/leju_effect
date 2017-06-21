// Vertex shader program
var VSHADER_SOURCE = v_shader_main;


// Fragment shader program
var FSHADER_SOURCE = f_shader_header    + 
                     f_uniform_list     +
                     f_varying_list     +
                     f_func_list        +
                     f_func_main;

//Uniform 变量名集合
var uniformNameSet = ["u_SampleImage",      "u_SamplerCurve",   "u_SamplerColorBalance", 
                      "u_Brightness",       "u_Contrast", 
                      "u_Hue",              "u_Saturation",     "u_Lightness", 
                      "u_InputMinStage",    "u_InputMaxStage",  "u_Gamma",              "u_OutputMinStage", "u_OutputMaxStage", 
                      "u_Sharpen",          "u_InvSize",
                      "u_PreserveLuminosity"];
//Uniform 集合
var uniformSet = [];

var gl;     //webgl context
var colorBalanceSetting = {
    cyan    : 0,
    magenta : 0,
    yellow  : 0,
    mode    : BALANCE_MODE.MIDTONES
};

function onBrightnessChanged(value)
{
    document.getElementById("brightness").innerHTML = value;
    gl.uniform1f(uniformSet['u_Brightness'], value);
    updateCanvas();
}

function onContrastChanged(value)
{
    document.getElementById("contrast").innerHTML = value;
    gl.uniform1f(uniformSet['u_Contrast'], value);
    updateCanvas();
}

function onHueChanged(value)
{
    document.getElementById("hue").innerHTML = value;
    gl.uniform1f(uniformSet['u_Hue'], value);
    updateCanvas();
}

function onSaturationChanged(value)
{
    document.getElementById("saturation").innerHTML = value;
    gl.uniform1f(uniformSet['u_Saturation'], value);
    updateCanvas();
}

function onLightnessChanged(value)
{
    document.getElementById("lightness").innerHTML = value;
    gl.uniform1f(uniformSet['u_Lightness'], value);
    updateCanvas();
}

function onInputStageMinChanged(value)
{
    document.getElementById("inputMinStage").innerHTML = value;
    gl.uniform1f(uniformSet['u_InputMinStage'], value);
    updateCanvas();
}

function onInputStageMaxChanged(value)
{
    document.getElementById("inputMaxStage").innerHTML = value;
    gl.uniform1f(uniformSet['u_InputMaxStage'], value);
    updateCanvas();
}

function onGammaChanged(value)
{
    document.getElementById("gamma").innerHTML = value;
    gl.uniform1f(uniformSet['u_Gamma'], value);
    updateCanvas();
}

function onOutputStageMinChanged(value)
{
    document.getElementById("outputMinStage").innerHTML = value;
    gl.uniform1f(uniformSet['u_OutputMinStage'], value);
    updateCanvas();
}

function onOutputStageMaxChanged(value)
{
    document.getElementById("outputMaxStage").innerHTML = value;
    gl.uniform1f(uniformSet['u_OutputMaxStage'], value);
    updateCanvas();
}
    
function onSharpenChanged(value)
{
    document.getElementById("sharpen").innerHTML = value;
    gl.uniform1f(uniformSet['u_Sharpen'], value / 100);
    updateCanvas();
}

function onCyanChanged(value)
{
    document.getElementById("cyan").innerHTML = value;
    colorBalanceSetting.cyan = value;
    var colorBalanceTable = pre_colorBalance(colorBalanceSetting);
    gl.activeTexture(gl.TEXTURE2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 256, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, colorBalanceTable);

    updateCanvas();
}

function onMagentaChanged(value)
{
    document.getElementById("magenta").innerHTML = value;
    colorBalanceSetting.magenta = value;
    var colorBalanceTable = pre_colorBalance(colorBalanceSetting);
    gl.activeTexture(gl.TEXTURE2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 256, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, colorBalanceTable);

    updateCanvas();
}

function onYellowChanged(value)
{
    document.getElementById("yellow").innerHTML = value;
    colorBalanceSetting.yellow = value;
    var colorBalanceTable = pre_colorBalance(colorBalanceSetting);
    gl.activeTexture(gl.TEXTURE2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 256, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, colorBalanceTable);

    updateCanvas();
}

function onHaloChanged(value)
{
    document.getElementById("halo").innerHTML = value;
    gl.uniform1f(uniformSet['u_Halo'], value / 100);
    updateCanvas();
}


function main() {
    // 获取Canvas
    var canvas = document.getElementById('webgl');

    // 获取webgl上下文
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // 初始化shader
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // 初始化点
    initVertexBuffers();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    initUniforms();
    
    initTextures();//加载图片
}

function initVertexBuffers() {
    var verticesTexCoords = new Float32Array([
        // Vertex coordinates, texture coordinate
        -1.0,  1.0,   0.0, 1.0,
        -1.0, -1.0,   0.0, 0.0,
         1.0,  1.0,   1.0, 1.0,
         1.0, -1.0,   1.0, 0.0,
    ]);

    // Create the buffer object
    var vertexTexCoordBuffer = gl.createBuffer();

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    //Get the storage location of a_Position, assign and enable buffer
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

    // Get the storage location of a_TexCoord
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');

    // Assign the buffer object to a_TexCoord variable
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object
}

function initUniforms() {
    for(var i = 0; i < uniformNameSet.length; i++) {
        uniformSet[uniformNameSet[i]] = gl.getUniformLocation(gl.program, uniformNameSet[i]);
        if (!uniformSet[uniformNameSet[i]]) {
            console.log('Failed to get the storage location of ' + 'uniformNameSet[i]');
            return false;
        }
    }
    
    gl.uniform1i(uniformSet['u_SampleImage'], 0);
    gl.uniform1i(uniformSet['u_SamplerCurve'], 1);
    gl.uniform1i(uniformSet['u_SamplerColorBalance'], 2);
    gl.uniform1f(uniformSet['u_Brightness'], 0);
    gl.uniform1f(uniformSet['u_Contrast'], 0);
    gl.uniform1f(uniformSet['u_Hue'], 0);
    gl.uniform1f(uniformSet['u_Saturation'], 0);
    gl.uniform1f(uniformSet['u_Lightness'], 0);
    gl.uniform1f(uniformSet['u_Sharpen'], 0);
    gl.uniform1i(uniformSet['u_PreserveLuminosity'], 1);
    gl.uniform1f(uniformSet['u_InputMinStage'], 0);
    gl.uniform1f(uniformSet['u_InputMaxStage'], 255);
    gl.uniform1f(uniformSet['u_Gamma'], 1);
    gl.uniform1f(uniformSet['u_OutputMinStage'], 0);
    gl.uniform1f(uniformSet['u_OutputMaxStage'], 255);
    gl.uniform1f(uniformSet['u_Halo'], 0);
}

//刷新页面，绘制canvas
function updateCanvas() {
    gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Draw the rectangle
}

function _createTexture(index, colorTable, image) {
    var texture =  gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
    if (colorTable) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 256, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, colorTable);
    }
    if (image) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    }
    
}

function initTextures() {
    //初始化曲线
    var points = [];
    points[0] = {x: 0, y: 0};
    points[1] = {x: 255, y: 255};
    var curveTable = pre_applyCurve(points);
    _createTexture(1, curveTable);
    
    //初始化色彩平衡
    var colorBalanceTable = pre_colorBalance(colorBalanceSetting);
    _createTexture(2, colorBalanceTable);
  
    var image = new Image();  // Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    
    // Register the event handler to be called on loading an image
    image.onload = function(){ 
                    //获取图片本身的像素信息，用于做后续分析工作，暂时没有这个需求
                    var canvas = document.createElement('canvas');
                    canvas.width = image.width;
                    canvas.height = image.height;
                    canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
                    var pixelData = canvas.getContext('2d').getImageData(0, 0, image.width, image.height).data;

                    //创建图片纹理
                    _createTexture(0, null, image);
                    gl.uniform2f(uniformSet['u_InvSize'], 1 / image.width, 1/ image.height);
                    
                    updateCanvas(); 
                 };
    // Tell the browser to load an image
    image.src = '../resources/view.jpg';

    return true;
}