"use strict";

var canvas;
var gl;

var NumVertices  = 18;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var modelViewMatrixLoc;
var world_to_camera = scalem(1, 1, -1);
var translation = vec3(-0.5, 0, 0);
//var scaling = vec3(1/6, 1/6, 1/6)
var rotX = 0;
var rotY = 0;
var ctm;
//var ctm = mult(ctm, scalem()

var t_increment = 0.1;
var r_increment = 5;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorDiamond();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // obtain the model matrix uniform location from the shader
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );

    render();
}

window.onkeypress = function( event ) {
    var key = String.fromCharCode(event.keyCode);
    switch( key ) {
        case 'y':
            rotY+= r_increment;
            break;
        case 'x':
            rotX+= r_increment;
            break;
    }
};


function colorDiamond()
{
    pyramid(0, 1, 2, 3, 0)
    pyramid(0, 1, 4, 3, 1)
}

function pyramid(a, b, c, d, col)
{
    var vertices = [
        vec4(  3.0,  0.0, -4.0, 1.0 ),
        vec4(  0.0,  0.0,  2.0, 1.0 ),
        vec4(  3.0, -6.0,  0.0, 1.0 ),
        vec4(  6.0,  0.0,  2.0, 1.0 ),
        vec4(  3.0,  6.0,  0.0, 1.0 )
    ];
    
    var vertexColors = [
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 0.0, 1.0, 0.0, 1.0 ], // green
    
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d , b, c, d];
    var color = col;
    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        if(color >= 2 && i%3 == 0){
            color = 0
        }
        else{
            if(i%3 == 0 && i!=0){
               color = color + 1
            }
        }
        //}
        // for solid colored faces use
        colors.push(vertexColors[color]);

    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    ctm = world_to_camera;

    ctm = mult(ctm, rotateX(rotX));
    ctm = mult(ctm, rotateY(rotY));
    ctm = mult(ctm, translate(translation));
    ctm = mult(ctm, scalem(1/6, 1/6, 1/6))

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame( render );
}
