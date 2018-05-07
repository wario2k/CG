"use strict";

var canvas;
var gl;

var index = 0;
var world_to_camera = scalem(1, 1, -1);
var pointsArray = [];
var normalsArray = [];

var lightPosition = vec4(1.0, 0.7, -0.2, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.1, 0.4, 0.9, 1.0  );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var shrink_scale = vec3(1/60, 1/90, 1/60);
var ctm;

var ambientColor, diffuseColor, specularColor;
var modelViewMatrixLoc;
var normalMatrixLoc;
var radius = 30;
var use_flat = true;
var vColorLoc;
var cone = vec4(0, 90, 0);


function cylinder(){

    var angle = ( 2 * Math.PI ) / 64.0;

    for(var i = 0; i < 65; ++i)
    {
        var cos         = Math.cos(angle * i);
        var cos2        = Math.cos(angle * ( i + 1) );
        var sin         = Math.sin(angle * i );
        var sin2        = Math.sin(angle * ( i + 1 ) );
        var _center     = vec4(0,60,0);
        var ver1        = vec4(radius * cos , 60, radius * sin);
        var ver2        = vec4(radius * cos2, 60, radius * sin2);
        var _center_2   = vec4(0,-60,0);
        var ver3        = vec4(radius * cos, -60, radius * sin);
        var ver4        = vec4(radius * cos2, -60, radius * sin2);


        //Top disk
        pointsArray.push(_center);
        normalsArray.push(_center[0],_center[1], _center[2], 0.0);
        pointsArray.push(ver1);
        normalsArray.push(ver1[0],ver1[1], ver1[2], 0.0);
        pointsArray.push(ver2);
        normalsArray.push(ver2[0],ver2[1], ver2[2], 0.0);

        //Cone
        pointsArray.push(cone);
        normalsArray.push(cone[0],cone[1], cone[2], 0.0);


        pointsArray.push(ver1);
        normalsArray.push(ver1[0],ver1[1], ver1[2], 0.0);
        pointsArray.push(ver2);
        normalsArray.push(ver2[0],ver2[1], ver2[2], 0.0);

        //Side
        pointsArray.push(ver1);
        normalsArray.push(ver1[0],ver1[1], ver1[2], 0.0);
        pointsArray.push(ver2);
        normalsArray.push(ver2[0],ver2[1], ver2[2], 0.0);
        pointsArray.push(ver4);
        normalsArray.push(ver4[0],ver4[1], ver4[2], 0.0);
        pointsArray.push(ver3);
        normalsArray.push(ver3[0],ver3[1], ver3[2], 0.0)
        pointsArray.push(ver4);
        normalsArray.push(ver4[0],ver4[1], ver4[2], 0.0)
        pointsArray.push(ver2);
        normalsArray.push(ver2[0],ver2[1], ver2[2], 0.0);

        //Bottom disk
        pointsArray.push(_center_2);
        normalsArray.push(_center_2[0],_center_2[1], _center_2[2], 0.0);
        pointsArray.push(ver3);
        normalsArray.push(ver3[0],ver3[1], ver3[2], 0.0);
        pointsArray.push(ver4);
        normalsArray.push(ver4[0],ver4[1], ver4[2], 0.0);



    }

}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    //init cylinder 
    cylinder();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal)


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    vColorLoc = gl.getUniformLocation(program, "vColor")

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct")     ,   flatten(ambientProduct)  );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct")     ,   flatten(diffuseProduct)  );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct")    ,   flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition")      ,   flatten(lightPosition)   );
    gl.uniform1f( gl.getUniformLocation(program,  "shininess")          ,   materialShininess );

    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    ctm = world_to_camera;


    ctm = mult(ctm, scalem(shrink_scale));
    //ctm = mult(ctm, rotateX());
    normalMatrix = [
        vec3(ctm[0][0], ctm[0][1], ctm[0][2]),
        vec3(ctm[1][0], ctm[1][1], ctm[1][2]),
        vec3(ctm[2][0], ctm[2][1], ctm[2][2])
    ];

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm));
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length);

    window.requestAnimFrame(render);
}
