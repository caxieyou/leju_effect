
var effectRender = new EffectRender();

//var gl;     //webgl context
var colorBalanceSetting = {
    cyan    : 0,
    magenta : 0,
    yellow  : 0,
    mode    : BALANCE_MODE.MIDTONES
};

function onBrightnessChanged(value)
{
    document.getElementById("brightness").innerHTML = value;
    effectRender.setUniform1f('u_Brightness', value);
}

function onContrastChanged(value)
{
    document.getElementById("contrast").innerHTML = value;
    effectRender.setUniform1f('u_Contrast', value);
}

function onHueChanged(value)
{
    document.getElementById("hue").innerHTML = value;
    effectRender.setUniform1f('u_Hue', value);
}

function onSaturationChanged(value)
{
    document.getElementById("saturation").innerHTML = value;
    effectRender.setUniform1f('u_Saturation', value);
}

function onLightnessChanged(value)
{
    document.getElementById("lightness").innerHTML = value;
    effectRender.setUniform1f('u_Lightness', value);
}

function onInputStageMinChanged(value)
{
    document.getElementById("inputMinStage").innerHTML = value;
    effectRender.setUniform1f('u_InputMinStage', value);
}

function onInputStageMaxChanged(value)
{
    document.getElementById("inputMaxStage").innerHTML = value;
    effectRender.setUniform1f('u_InputMaxStage', value);
}

function onGammaChanged(value)
{
    document.getElementById("gamma").innerHTML = value;
    effectRender.setUniform1f('u_Gamma', value);
}

function onOutputStageMinChanged(value)
{
    document.getElementById("outputMinStage").innerHTML = value;
    effectRender.setUniform1f('u_OutputMinStage', value);
}

function onOutputStageMaxChanged(value)
{
    document.getElementById("outputMaxStage").innerHTML = value;
    effectRender.setUniform1f('u_OutputMaxStage', value);
}
    
function onSharpenChanged(value)
{
    document.getElementById("sharpen").innerHTML = value;
    effectRender.setUniform1f('u_Sharpen', value);
}

function onCyanChanged(value)
{
    document.getElementById("cyan").innerHTML = value;
    colorBalanceSetting.cyan = value;
    var colorBalanceTable = pre_colorBalance(colorBalanceSetting);
    effectRender.setColorBalance(colorBalanceTable);
    return colorBalanceTable;
}

function onMagentaChanged(value)
{
    document.getElementById("magenta").innerHTML = value;
    colorBalanceSetting.magenta = value;
    var colorBalanceTable = pre_colorBalance(colorBalanceSetting);
    effectRender.setColorBalance(colorBalanceTable);
    return colorBalanceTable;
}

function onYellowChanged(value)
{
    document.getElementById("yellow").innerHTML = value;
    colorBalanceSetting.yellow = value;
    var colorBalanceTable = pre_colorBalance(colorBalanceSetting);
    effectRender.setColorBalance(colorBalanceTable);
    return colorBalanceTable;
}

function onHaloChanged(value)
{
    document.getElementById("halo").innerHTML = value;
    effectRender.setUniform1f('u_Halo', value);
}

function onDownLoad() {
    var canvas = document.getElementById('webgl');
    var dataURL = effectRender.dump(canvas);
    dataURL = dataURL.replace("image/png", "image/octet-stream");
    
    var dataUrlArray = dataURL.split(",");
    var mime = dataUrlArray[0].match(/:(.*?);/)[1];
    var binaryString = atob(dataUrlArray[1]);
    var binaryStringLength = binaryString.length;
    var u8array = new Uint8Array(binaryStringLength);
    while (binaryStringLength--) {
        u8array[binaryStringLength] = binaryString.charCodeAt(binaryStringLength);
    }
    var blob = new Blob([u8array], {type: mime});
    var urlCreator = window.URL || window.webkitURL || window;
    var imageUrl = urlCreator.createObjectURL(blob);
    
    var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    save_link.href = imageUrl;
    save_link.download = "XXXX.png";
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(event);
}

function onChangeImage() {
    var image = new Image();  // Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    
    // Register the event handler to be called on loading an image
    image.onload = function(){ 
                    var canvas = document.getElementById('webgl');
                    canvas.style.width = 899 + "px";
                    canvas.style.height = 587 + "px";
                    canvas.width = 899;
                    canvas.height = 587;
        
                    effectRender.setSrcImage(image, 899, 587);
                 };
    // Tell the browser to load an image
    image.src = '../resources/view2.jpg';
}

//var points = [];
//points[0] = {x: 0, y: 0};
//points[1] = {x: 255, y: 255};
//var curveTable = pre_applyCurve(points);
//Points是个数组，每个含有x和y变量，都在0-255之间，x顺序从小到大排列
function onCurveChanged(points) {
    var curveTable = pre_applyCurve(points);
    //this._createTexture(1, curveTable);
    effectRender.setCurve(curveTable);
    return curveTable;
}

function hist(image) {
    
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
    var pixelData = canvas.getContext('2d').getImageData(0, 0, image.width, image.height).data;
                    
    var histCount = new Array(256); 

    for (var i = 0; i < 256; i++) {
        histCount[i] = 0;
    }
    
    for(var i = 0; i < image.height ; i++)
    {
        for(var j = 0 ; j < image.width ; j++)
        {
            var offset = (i * image.width + j) * 4;
            
            var r = pixelData[offset + 0];
            var g = pixelData[offset + 1];
            var b = pixelData[offset + 2];
            
            var grayValue =  Math.floor(r * 0.299 + g * 0.587 + b * 0.114);
            //debugger;
            histCount[grayValue]++;
        }
    }
    for (var i = 0; i < 256; i++) {
        histCount[i] /= image.width * image.height;
    }
    
    return histCount;
}

function main() {
    // 获取Canvas
    var canvas = document.getElementById('webgl');

    effectRender.init(canvas);
    
    var image = new Image();  // Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    
    // Register the event handler to be called on loading an image
    image.onload = function(){ 
                    effectRender.setSrcImage(image);
                 };
    // Tell the browser to load an image
    image.src = '../resources/view.jpg';
}