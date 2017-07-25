

function EffectRender() {
    this._gl             = null;
    this._vshader_source = v_shader_main;
    this._fshader_source = f_shader_header    + 
                           f_uniform_list     +
                           f_varying_list     +
                           f_func_list        +
                           f_func_main;
    this._uniformNameSet = ["u_SampleImage",      "u_SamplerCurve",   "u_SamplerColorBalance", 
                            "u_Brightness",       "u_Contrast", 
                            "u_Hue",              "u_Saturation",     "u_Lightness", 
                            "u_InputMinStage",    "u_InputMaxStage",  "u_Gamma",              "u_OutputMinStage", "u_OutputMaxStage", 
                            "u_Sharpen",          "u_InvSize",
                            "u_PreserveLuminosity", "u_Halo", "u_Scale"];
    this._uniformSet     = [];
    this._srcImg         = null;
    this._fbo            = null;
};

EffectRender.prototype.init = function(canvas) {
    
    this._gl = getWebGLContext(canvas);
    this._gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    initShaders(this._gl, this._vshader_source, this._fshader_source);
    
    this._initVertexBuffers();
    this._initUniforms(this._uniformNameSet);
    this._initTextures();
};

EffectRender.prototype._initFramebufferObject = function() {
  var framebuffer, texture, depthBuffer;

  // Define the error handling function
  var error = function() {
    if (framebuffer) this._gl.deleteFramebuffer(framebuffer);
    if (texture) this._gl.deleteTexture(texture);
    if (depthBuffer) this._gl.deleteRenderbuffer(depthBuffer);
    return null;
  }

  // Create a frame buffer object (FBO)
  framebuffer = this._gl.createFramebuffer();
  if (!framebuffer) {
    console.log('Failed to create frame buffer object');
    return error();
  }

  // Create a texture object and set its size and parameters
  texture = this._gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log('Failed to create texture object');
    return error();
  }
  this._gl.activeTexture(this._gl.TEXTURE3);
  this._gl.bindTexture(this._gl.TEXTURE_2D, texture); // Bind the object to target
  this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._srcImg.width, this._srcImg.height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
  this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
  framebuffer.texture = texture; // Store the texture object
  
  // Attach the texture and the renderbuffer object to the FBO
  this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);
  this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, texture, 0);
  //this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, depthBuffer);

  // Check if FBO is configured correctly
  var e = this._gl.checkFramebufferStatus(this._gl.FRAMEBUFFER);
  if (this._gl.FRAMEBUFFER_COMPLETE !== e) {
    console.log('Frame buffer object is incomplete: ' + e.toString());
    return error();
  }

  // Unbind the buffer object
  this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
  this._gl.bindTexture(this._gl.TEXTURE_2D, null);
  this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);

  return framebuffer;
};

EffectRender.prototype._initVertexBuffers = function() {
    var verticesTexCoords = new Float32Array([
        // Vertex coordinates, texture coordinate
        -1.0,  1.0,   0.0, 1.0,
        -1.0, -1.0,   0.0, 0.0,
         1.0,  1.0,   1.0, 1.0,
         1.0, -1.0,   1.0, 0.0,
    ]);

    // Create the buffer object
    var vertexTexCoordBuffer = this._gl.createBuffer();

    // Bind the buffer object to target
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, verticesTexCoords, this._gl.STATIC_DRAW);

    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    //Get the storage location of a_Position, assign and enable buffer
    var a_Position = this._gl.getAttribLocation(this._gl.program, 'a_Position');

    this._gl.vertexAttribPointer(a_Position, 2, this._gl.FLOAT, false, FSIZE * 4, 0);
    this._gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

    // Get the storage location of a_TexCoord
    var a_TexCoord = this._gl.getAttribLocation(this._gl.program, 'a_TexCoord');

    // Assign the buffer object to a_TexCoord variable
    this._gl.vertexAttribPointer(a_TexCoord, 2, this._gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    this._gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object
};

EffectRender.prototype._initUniforms = function(uniformNameSet) {
    for(var i = 0; i < uniformNameSet.length; i++) {
        this._uniformSet[uniformNameSet[i]] = this._gl.getUniformLocation(this._gl.program, uniformNameSet[i]);
        if (!this._uniformSet[uniformNameSet[i]]) {
            console.log('Failed to get the storage location of ' + 'uniformNameSet[i]');
            return false;
        }
    }
    
    this._gl.uniform1i(this._uniformSet['u_SampleImage'], 0);
    this._gl.uniform1i(this._uniformSet['u_SamplerCurve'], 1);
    this._gl.uniform1i(this._uniformSet['u_SamplerColorBalance'], 2);
    this._gl.uniform1i(this._uniformSet['u_PreserveLuminosity'], 1);
    this._gl.uniform1f(this._uniformSet['u_Brightness'], 0);
    this._gl.uniform1f(this._uniformSet['u_Contrast'], 0);
    this._gl.uniform1f(this._uniformSet['u_Hue'], 0);
    this._gl.uniform1f(this._uniformSet['u_Saturation'], 0);
    this._gl.uniform1f(this._uniformSet['u_Lightness'], 0);
    this._gl.uniform1f(this._uniformSet['u_Sharpen'], 0);
    this._gl.uniform1f(this._uniformSet['u_InputMinStage'], 0);
    this._gl.uniform1f(this._uniformSet['u_InputMaxStage'], 255);
    this._gl.uniform1f(this._uniformSet['u_Gamma'], 1);
    this._gl.uniform1f(this._uniformSet['u_OutputMinStage'], 0);
    this._gl.uniform1f(this._uniformSet['u_OutputMaxStage'], 255);
    this._gl.uniform1f(this._uniformSet['u_Halo'], 0);
    this._gl.uniform1f(this._uniformSet['u_Scale'], 1);
};

EffectRender.prototype._initTextures = function() {
    //初始化曲线
    var points = [];
    points[0] = {x: 0, y: 0};
    points[1] = {x: 255, y: 255};
    var curveTable = pre_applyCurve(points);
    this._createTexture(1, curveTable);
    
    //初始化色彩平衡
    var colorBalanceTable = pre_colorBalance(colorBalanceSetting);
    this._createTexture(2, colorBalanceTable);
};

EffectRender.prototype._createTexture = function(index, colorTable, image) {
    var texture =  this._gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    
    this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    this._gl.activeTexture(this._gl.TEXTURE0 + index);
    this._gl.bindTexture(this._gl.TEXTURE_2D, texture);

    if (index === 2) {
        this.xxx = texture;
    }
    // Set the texture parameters
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
        
    if (colorTable) {
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGB, 256, 1, 0, this._gl.RGB, this._gl.UNSIGNED_BYTE, colorTable);
    }
    if (image) {
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGB, this._gl.RGB, this._gl.UNSIGNED_BYTE, image);
        this._gl.uniform2f(this._uniformSet['u_InvSize'], 1 / image.width, 1/ image.height);
    }
};

EffectRender.prototype.updateCanvas = function(isFBO) {
    if (isFBO) {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._fbo);
    }

    this._gl.clear(this._gl.COLOR_BUFFER_BIT);   // Clear <canvas>
    this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4); // Draw the rectangle
    //强制刷新，异步改为同步
    var syncBuffer = new Uint8Array(4); 
    this._gl.readPixels(0, 0, 1, 1, this._gl.RGBA, this._gl.UNSIGNED_BYTE, syncBuffer);
    
    if (isFBO) {
         this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }
};

//width 和 height 是canvas的宽高
EffectRender.prototype.setSrcImage = function(image, width, height) {
    var localImage;
    if (image.width > 4096 || image.height > 4096) {
        var newWidth, newHeight;
        if (image.width >= image.height) {
            newHeight = Math.floor(image.height * 4096 / image.width);
            newWidth  = 4096;
        } else {
            newWidth  = Math.floor(image.width * 4096 / image.height);
            newHeight = 4096;
        }
        //这一步重绘需要花一点时间
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, newWidth, newHeight);
        var that = this;
        //create a new image
        var newImage = new Image();
        newImage.name = "patch_" + i;
        newImage.crossOrigin = "";
        newImage.onload = function(){
            if (!that._srcImg) {
                that._createTexture(0, null, newImage);
            } else {
                that._gl.activeTexture(that._gl.TEXTURE0);
                that._gl.texImage2D(that._gl.TEXTURE_2D, 0, that._gl.RGB, that._gl.RGB, that._gl.UNSIGNED_BYTE, newImage);
            }
            
            that._srcImg = newImage;
            that._gl.uniform2f(that._uniformSet['u_InvSize'], 1 / newImage.width, 1/ newImage.height);
            var _width = width || newImage.width;
            var _height = height || newImage.height;
            that._gl.viewport(0, 0, _width, _height);
            
            that._gl.uniform1f(that._uniformSet['u_Scale'], 0.25/*Math.min(_width / that._srcImg.width, 1.0)*/);
            console.log("change image: " + Math.min(_width / that._srcImg.width, 1.0));
            that.reset();
            that.updateCanvas();
            that._fbo = that._initFramebufferObject();
        };
        newImage.src = canvas.toDataURL("image/png");
    } else {
        if (!this._srcImg) {
            this._createTexture(0, null, image);
        } else {
            this._gl.activeTexture(this._gl.TEXTURE0);
            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGB, this._gl.RGB, this._gl.UNSIGNED_BYTE, image);
        }
        
        this._srcImg = image;
        this._gl.uniform2f(this._uniformSet['u_InvSize'], 1 / image.width, 1/ image.height);
        var _width = width || image.width;
        var _height = height || image.height;
        this._gl.viewport(0, 0, _width, _height);
        this._gl.uniform1f(this._uniformSet['u_Scale'], Math.min(_width / this._srcImg.width, 1.0));
        this.reset();
        this.updateCanvas();
        this._fbo = this._initFramebufferObject();
        console.log(this._fbo);
    }
    
};

EffectRender.prototype.dump = function(canvas, isFBO) {

        var oldWidth = canvas.width;
        var oldHeight = canvas.height;
        
        canvas.style.width = this._srcImg.width + "px";
        canvas.style.height = this._srcImg.height + "px";
        canvas.width = this._srcImg.width;
        canvas.height = this._srcImg.height;
        this._gl.viewport(0, 0, this._srcImg.width, this._srcImg.height);
        this._gl.uniform1f(this._uniformSet['u_Scale'], Math.min(canvas.width / this._srcImg.width, 1.0));
        this.updateCanvas(isFBO);
        var thumbnail
        if (!isFBO) {
            thumbnail = canvas.toDataURL("image/png");
        } else {
            thumbnail = this._fbo.texture;
        }

        canvas.style.width = oldWidth + "px";
        canvas.style.height = oldHeight + "px";
        canvas.width = oldWidth;
        canvas.height = oldHeight;
        this._gl.viewport(0, 0, oldWidth, oldHeight);
        this._gl.uniform1f(this._uniformSet['u_Scale'], Math.min(canvas.width / this._srcImg.width, 1.0));
        this.updateCanvas();
        return thumbnail;
    
}

//假设你已经把canvas给resize好了，把它的宽高传进来
EffectRender.prototype.resize = function(width, height) {
    this._gl.viewport(0, 0, width, height);
    this._gl.uniform1f(this._uniformSet['u_Scale'], Math.min(width / this._srcImg.width, 1.0));
    this.updateCanvas();
}


EffectRender.prototype.reset = function(setting) {
    if(setting) {
        /*
        this._gl.uniform1f(this._uniformSet['u_Brightness'], setting.brightness);
        this._gl.uniform1f(this._uniformSet['u_Contrast'], setting.contrast);
        ...
        //设置曲线的颜色映射
        this._gl.activeTexture(this._gl.TEXTURE1);
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGB, 256, 1, 0, this._gl.RGB, this._gl.UNSIGNED_BYTE, setting.curveMap);
        
        //设置色彩平衡的颜色映射
        this._gl.activeTexture(this._gl.TEXTURE2);
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGB, 256, 1, 0, this._gl.RGB, this._gl.UNSIGNED_BYTE, setting.colorBalanceMap);
        */
        
    } else {
        this._gl.uniform1f(this._uniformSet['u_Brightness'], 0);
        this._gl.uniform1f(this._uniformSet['u_Contrast'], 0);
        this._gl.uniform1f(this._uniformSet['u_Hue'], 0);
        this._gl.uniform1f(this._uniformSet['u_Saturation'], 0);
        this._gl.uniform1f(this._uniformSet['u_Lightness'], 0);
        this._gl.uniform1f(this._uniformSet['u_Sharpen'], 0);
        this._gl.uniform1f(this._uniformSet['u_InputMinStage'], 0);
        this._gl.uniform1f(this._uniformSet['u_InputMaxStage'], 255);
        this._gl.uniform1f(this._uniformSet['u_Gamma'], 1);
        this._gl.uniform1f(this._uniformSet['u_OutputMinStage'], 0);
        this._gl.uniform1f(this._uniformSet['u_OutputMaxStage'], 255);
        this._gl.uniform1f(this._uniformSet['u_Halo'], 0);
        
        var resetMap = new Uint8Array(256 * 3);
        for (var i = 0; i < 256; i++) {
            resetMap[i * 3] = i;
            resetMap[i * 3 + 1] = i;
            resetMap[i * 3 + 2] = i;
        }
        
        //设置曲线的颜色映射
        this._gl.activeTexture(this._gl.TEXTURE1);
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGB, 256, 1, 0, this._gl.RGB, this._gl.UNSIGNED_BYTE, resetMap);
        
        //设置色彩平衡的颜色映射
        this._gl.activeTexture(this._gl.TEXTURE2);
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGB, 256, 1, 0, this._gl.RGB, this._gl.UNSIGNED_BYTE, resetMap);
        
    }
    
    this.updateCanvas();
};

EffectRender.prototype.setUniform1f = function(name, value) {
    this._gl.uniform1f(this._uniformSet[name], value);
    this.updateCanvas();
};

EffectRender.prototype.setColorBalance = function(colorBalanceTable) {
    this._gl.activeTexture(this._gl.TEXTURE2);
    this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGB, 256, 1, 0, this._gl.RGB, this._gl.UNSIGNED_BYTE, colorBalanceTable);
    this.updateCanvas();
};

EffectRender.prototype.setCurve = function(colorCurveTable) {
    this._gl.activeTexture(this._gl.TEXTURE1);
    this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGB, 256, 1, 0, this._gl.RGB, this._gl.UNSIGNED_BYTE, colorCurveTable);
    this.updateCanvas();
};
