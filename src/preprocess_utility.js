//图片预处理和处理文件，CPU级别，均已pre_打头

//创建曲线颜色映射,带“_”表示是内置函数，不对外
function _spline(x, y, n, t, m) {
    var dy = [];
    var ddy = [];
    var z = [];
    for(var i = 0; i < n; i++) {
        dy[i] = 0;
        ddy[i] = 0;
    }
    dy[0] = -0.5;
    
    var h1;
    var s = [];
    var h0 = x[1] - x[0];

    s[0] = 3.0 * (y[1] - y[0]) / (2.0 * h0) - ddy[0] * h0 / 4.0;
    
    for(var j = 1; j <= n - 2; ++j) {
        h1 = x[j + 1] - x[j];
        var alpha = h0 / (h0 + h1);
        var beta = (1.0 - alpha) * (y[j] - y[j - 1]) / h0;
        beta = 3.0 * (beta + alpha * ( y[j + 1] - y[j] ) / h1);
        dy[j] = -alpha / (2.0 + (1.0 - alpha) * dy[j - 1]);
        s[j] = (beta - (1.0 - alpha) * s[j - 1]);
        s[j] = s[j] / (2.0 + (1.0 - alpha) * dy[j - 1]);
        h0 = h1;
    }
    
    dy[n-1] = (3.0*(y[n-1] - y[n-2]) / h1 + ddy[n-1] * h1/2.0 - s[n-2]) / (2.0 + dy[n-2]);

    for( var j = n - 2; j >= 0; --j ) {
        dy[j] = dy[j] * dy[j + 1] + s[j];
    }

    for( var j = 0; j <= n - 2; ++j ) {
        s[j] = x[j + 1] - x[j];
    }

    for( var j = 0; j <= n - 2; ++j ) {
        h1 = s[j] * s[j];
        ddy[j] = 6.0 * (y[j+1] - y[j]) / h1 - 2.0 * (2.0 * dy[j] + dy[j+1]) / s[j];
    }

    h1 = s[n-2] * s[n-2];
    ddy[n-1] = 6.0 * (y[n-2] - y[n-1]) / h1 + 2.0 * (2.0 * dy[n-1] + dy[n-2]) / s[n-2];
    var g = 0.0;
    for(var i=0; i<=n-2; i++) {
        h1 = 0.5 * s[i] * (y[i] + y[i+1]);
        h1 = h1 - s[i] * s[i] * s[i] * (ddy[i] + ddy[i+1]) / 24.0;
        g = g + h1;
    }

    for(var j=0; j<=m-1; j++) {
        var i;
        if( t[j] >= x[n-1] ) {
            i = n - 2;
        } else {
            i = 0;
            while(t[j] > x[i+1]) {
                i = i + 1;
            }
        }
        h1 = (x[i+1] - t[j]) / s[i];
        h0 = h1 * h1;
        z[j] = (3.0 * h0 - 2.0 * h0 * h1) * y[i];
        z[j] = z[j] + s[i] * (h0 - h0 * h1) * dy[i];
        h1 = (t[j] - x[i]) / s[i];
        h0 = h1 * h1;
        z[j] = z[j] + (3.0 * h0 - 2.0 * h0 * h1) * y[i+1];
        z[j] = z[j] - s[i] * (h0 - h0 * h1) * dy[i+1];
    }
    return z;
}

//内部函数，限制值为0-255
function _clampColor(value) {
    return Math.max(Math.min(value, 255), 0);
}

//预处理函数，根据曲线上的点，输出颜色映射表
//points是一个[]，每一个内部项由x和y组成
//x和y都限制在0-255，且x要从小到大排布
//points = [{x : 0, y : 0}, {x : 255, y : 255}];
//这个曲线应用是RGB同时应用的，如果要求单通道，到时候再联系我
function pre_applyCurve(points) {
    for (var i = 0; i < points.length; i++) {
        points[i].x = Math.floor(points[i].x);
        points[i].y = Math.floor(points[i].y);
    }
    
    //if count of control points is less than 2, return linear output
    var colorMap = new Uint8Array(256 * 3);
    if (points.length < 2) {
        for (var i = 0; i < 256; i++) {
            colorMap[i * 3] = i;
            colorMap[i * 3 + 1] = i;
            colorMap[i * 3 + 2] = i;
        }
        return colorMap;
    }

    //if count of control points is 2, return linear output
    if (points.length === 2 ) {
        var delta_y = 0;
        if (points[1].x != points[0].x) {
            delta_y = (points[1].y - points[0].y) * 1.0 / (points[1].x - points[0].x);
        }

        //create output
        for (var i = 0; i < 256; ++i ) {
            if ( i < points[0].x ) {
                colorMap[i * 3] = points[0].y;
                colorMap[i * 3 + 1] = points[0].y;
                colorMap[i * 3 + 2] = points[0].y;
            } else if ( i >= points[0].x && i < points[1].x ) {
                colorMap[i * 3] = _clampColor(points[0].y + delta_y * (i - points[0].x));
                colorMap[i * 3 + 1] = _clampColor(points[0].y + delta_y * (i - points[0].x));
                colorMap[i * 3 + 2] = _clampColor(points[0].y + delta_y * (i - points[0].x));
            } else {
                colorMap[i * 3] = points[1].y;
                colorMap[i * 3 + 1] = points[1].y;
                colorMap[i * 3 + 2] = points[1].y;
            }
        }
        return colorMap;
    }

    var x = [];
    var y = [];
    var startPoint, endPoint;
    
    for (var i = 0; i < points.length; i++) {
        if ( i == 0 ) {
            start_point = points[i];
        }
        x[i] = points[i].x - start_point.x;
        y[i] = points[i].y;
        endPoint = points[i];
    }


    //if start_point or endPoint is invalid
    if (start_point == points[points.length - 1] || start_point == endPoint) {
        for (var i = 0; i < 256; ++i ) {
            colorMap[i * 3] = i;
            colorMap[i * 3 + 1] = i;
            colorMap[i * 3 + 2] = i;
        }
        return colorMap;
    }
    
    var m = endPoint.x - start_point.x;
    var t = [];  //array of x-coordinate of output points
    var z = [];  //array of y-coordinate of output points
    //initialize array of x-coordinate
    for ( var i = 0; i< m; ++i ) {
        t[i] = i;
    }
    
    z = _spline(x, y, points.length, t, m);
    
    //create output
    for ( var i = 0; i < 256; ++i ) {
        if ( i < start_point.x ) {
            colorMap[i * 3] = start_point.y;
            colorMap[i * 3 + 1] = start_point.y;
            colorMap[i * 3 + 2] = start_point.y;
        } else if ( i >= start_point.x && i < endPoint.x ) {
            colorMap[i * 3] = _clampColor(z[i - start_point.x]);
            colorMap[i * 3 + 1] = _clampColor(z[i - start_point.x]);
            colorMap[i * 3 + 2] = _clampColor(z[i - start_point.x]);
        } else {
            colorMap[i * 3] = endPoint.y;
            colorMap[i * 3 + 1] = endPoint.y;
            colorMap[i * 3 + 2] = endPoint.y;
        }
    }

    return colorMap;
}

//参考Photoshop的色彩平衡面板，色彩平衡的选项：阴影，中间调，高光
var BALANCE_MODE = {
    SHADOWS: 0,
    MIDTONES: 1,
    HIGHLIGHTS: 2
}
//参考Photoshop的色彩平衡面板，青色，杨红，黄色，模式
function pre_colorBalance(setting)
{
    //Make sure cyan, magenta, yellow are between -100 to 100
    var cyan    = setting.cyan;
    var magenta = setting.magenta;
    var yellow  = setting.yellow;
    var mode    = setting.mode;
    var cyan_red = [0, 0, 0];
    var magenta_green = [0, 0, 0];
    var yellow_blue = [0, 0, 0];
    
    cyan_red[mode] = cyan;
    magenta_green[mode] = magenta;
    yellow_blue[mode] = yellow;
    
    var highlights_add = new Float32Array(256); 
    var midtones_add   = new Float32Array(256); 
    var shadows_add    = new Float32Array(256); 
    var highlights_sub = new Float32Array(256); 
    var midtones_sub   = new Float32Array(256); 
    var shadows_sub    = new Float32Array(256); 

    //initTransferArray();
    for (var i = 0; i < 256; i++)
    {
        highlights_add[i] = shadows_sub[255 - i] = (1.075 - 1 / (i / 16.0 + 1));
        var v = ((i - 127.0) / 127.0) * ((i - 127.0) / 127.0);
        midtones_add[i]   = midtones_sub[i]      = 0.667 * (1 - v);
        shadows_add[i]    = highlights_sub[i]    = 0.667 * (1 - v);
    }
    
    //create the table
    var cyan_red_transfer = [];
    var magenta_green_transfer = [];
    var yellow_blue_transfer = [];
    
    var r_lookup = new Uint8Array(256);
    var g_lookup = new Uint8Array(256);
    var b_lookup = new Uint8Array(256);
    var red, green, blue;
    
    cyan_red_transfer[BALANCE_MODE.SHADOWS]         = (cyan_red[BALANCE_MODE.SHADOWS] > 0) ? shadows_add : shadows_sub;
    cyan_red_transfer[BALANCE_MODE.MIDTONES]        = (cyan_red[BALANCE_MODE.MIDTONES] > 0) ? midtones_add : midtones_sub;
    cyan_red_transfer[BALANCE_MODE.HIGHLIGHTS]      = (cyan_red[BALANCE_MODE.HIGHLIGHTS] > 0) ? highlights_add : highlights_sub;
    magenta_green_transfer[BALANCE_MODE.SHADOWS]    = (magenta_green[BALANCE_MODE.SHADOWS] > 0) ? shadows_add : shadows_sub;
    magenta_green_transfer[BALANCE_MODE.MIDTONES]   = (magenta_green[BALANCE_MODE.MIDTONES] > 0) ? midtones_add : midtones_sub;
    magenta_green_transfer[BALANCE_MODE.HIGHLIGHTS] = (magenta_green[BALANCE_MODE.HIGHLIGHTS] > 0) ? highlights_add : highlights_sub;
    yellow_blue_transfer[BALANCE_MODE.SHADOWS]      = (yellow_blue[BALANCE_MODE.SHADOWS] > 0) ? shadows_add : shadows_sub;
    yellow_blue_transfer[BALANCE_MODE.MIDTONES]     = (yellow_blue[BALANCE_MODE.MIDTONES] > 0) ? midtones_add : midtones_sub;
    yellow_blue_transfer[BALANCE_MODE.HIGHLIGHTS]   = (yellow_blue[BALANCE_MODE.HIGHLIGHTS] > 0) ? highlights_add : highlights_sub;
    
    for (var i = 0; i < 256; i++)
    {
        red = i;
        green = i;
        blue = i;
        red += (  cyan_red[BALANCE_MODE.SHADOWS] * cyan_red_transfer[BALANCE_MODE.SHADOWS][red]
                + cyan_red[BALANCE_MODE.MIDTONES] * cyan_red_transfer[BALANCE_MODE.MIDTONES][red]
                + cyan_red[BALANCE_MODE.HIGHLIGHTS] * cyan_red_transfer[BALANCE_MODE.HIGHLIGHTS][red]);
        
        red = _clampColor(red);
        
        green += ( magenta_green[BALANCE_MODE.SHADOWS] * magenta_green_transfer[BALANCE_MODE.SHADOWS][green]
                 + magenta_green[BALANCE_MODE.MIDTONES] * magenta_green_transfer[BALANCE_MODE.MIDTONES][green]
                 + magenta_green[BALANCE_MODE.HIGHLIGHTS] * magenta_green_transfer[BALANCE_MODE.HIGHLIGHTS][green]);
        
        green = _clampColor(green);
        
        blue += ( yellow_blue[BALANCE_MODE.SHADOWS] * yellow_blue_transfer[BALANCE_MODE.SHADOWS][blue]
                + yellow_blue[BALANCE_MODE.MIDTONES] * yellow_blue_transfer[BALANCE_MODE.MIDTONES][blue]
                + yellow_blue[BALANCE_MODE.HIGHLIGHTS] * yellow_blue_transfer[BALANCE_MODE.HIGHLIGHTS][blue]);
        blue = _clampColor (blue);
        
        r_lookup[i] = red;
        g_lookup[i] = green;
        b_lookup[i] = blue;
    }
    
    var colorMap = new Uint8Array(256 * 3);
    
    for (var i = 0; i < 256; i++) {
        colorMap[i * 3 ] = r_lookup[i];
        colorMap[i * 3 + 1] = g_lookup[i];
        colorMap[i * 3 + 2] = b_lookup[i];
    }
    
    return colorMap;
}
