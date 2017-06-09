# leju_effect
basic 2d effect with shader
develop branch for develop

This is the basic project for simple 2D effect with webgl shader calculation.
File structure: 

.
├── lib
│   ├── cuon-matrix.js // Webgl Matrix 4 * 4 class, no need to care here
│   ├── cuon-utils.js  // Webgl Shader warpper, no need to care here
│   ├── webgl-debug.js // Webgl tool for debug, no need to care here
│   ├── webgl-utils.js // Webgl warpper, no need to care here
│
├── resources
│   ├── view.jpg       // A giant image which is 2560 * 1600 for testing the effects' speed
│
├── src
│   ├── effect.html    // The frontend web page, which includes the UI
│   ├── effect.js      // The webgl shader and function logic
│
├── README.md

Setup:
    Just open the effect.html, if there is no image shows on the page, then do the following steps:
    (Assume the browser is chrome)
    1. Right click on the Chrome's icon, choose property(Last option)
    2. Add "--enable-webgl --ignore-gpu-blacklist --allow-file-access-from-files" in the "Target"
    For example:
    My path for chrome is : C:\Users\Lee\AppData\Local\Google\Chrome\Application\chrome.exe
    Then it becames:
    C:\Users\Lee\AppData\Local\Google\Chrome\Application\chrome.exe --enable-webgl --ignore-gpu-blacklist --allow-file-access-from-files

    Restart the Chrome then.

    PS: Shut down all the chrome pages before doing these.

Adjust the effect:
    There are several effects on the page you can play with:
    亮度(Brightness)
    对比度(Contrast)
    色相(Hue)
    饱和度(u_Saturation)
    明度(Lightness)
    色阶(Level)
    锐化(Sharpen)
    Each one will have the immediately effect showing on the page.

Code:
    The code is not that hard to understand:
    All the key functions are start with "on" and end with "adjust"
    Such as "onHueAdjust"
    Passing the parameters from the frontend page into the shader.
    
Shaer:
    I combine all the function into one big shader since it's easy to implement. It's totally ok
    to split them and use them in different canvases.

    'void main() {\n' +
    '   vec3 color = texture2D(u_Sampler, v_TexCoord).xyz * 255.0;\n' + 
    
    '   color = brightAdjust(color);  \n' +
    '   color = contrastAdjust(color);  \n' +
    '   color = hslAdjustment(color);  \n' +
    '   color = stageAdjust(color);  \n' +
    '   color = sharpenAdjust(color);  \n' +
    '   gl_FragColor = vec4(color / 255.0, 1.0);\n' +
    
    '}\n';
    
    The shader takes the image texture's info, which is pixel as vec3 color, then pass it into the effect functions.
    Such as brightAdjust() or contrastAdjust()
    No need to read the implementation of each function.
    
Q&A:
    just contact me by QQ or wechar or by phone.
    
Li
    






