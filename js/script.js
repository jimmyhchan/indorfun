// (c) Dean McNamee <dean@gmail.com>.  All rights reserved.

window.addEventListener('load', function() {
  var boxColor = new Pre3d.RGBA(1, 1, 1, 0.4);
  var edgeColor = new Pre3d.RGBA(0x00/255, 0x66/255, 0x99/255, 1);
  var goalColor = new Pre3d.RGBA(0xFF/255, 0xFF/255, 0x00/255, 1);
  var doneGoalColor = new Pre3d.RGBA(0xFF/255, 0xFF/255, 0x00/255, 0.3);
  var dangerColor = new Pre3d.RGBA(0.1, 0.1, 0.1, 1);
  // var gridColor = new Pre3d.RGBA(0x00/255, 0x66/255, 0x99/255, 1);
  var size = 1; //Int becuase we're doing some nasty rounding when getting positions
  var score = 0;
  var statusText = "test";
  ddbugg = true;

  var movePenalty = -25;
  var goalScore = 300;
  var goals = [ 
    { coord:[0, 0], active: 1 }, 
    { coord:[1, 1], active: 1 }, 
    { coord:[3, 1], active: 1 }, 
    { coord:[2, 3], active: 1 }, 
    { coord:[5, 2], active: 1 }, 
    { coord:[1, 6], active: 1 }, 
    { coord:[1, 8], active: 1 } 
  ];
  dangerScore = -100;
  var dangers = [ 
    { coord:[4, 0], active: -1 }, 
    { coord:[2, 2], active: -1 }, 
    { coord:[1, 4], active: -1 }, 
    { coord:[8, 0], active: -1 }, 
    { coord:[3, 5], active: -1 }, 
    { coord:[4, 5], active: -1 }, 
    { coord:[2, 8], active: -1 } 
  ];


  var cubePosition = { 
    x:size/2, 
    y:size/2, 
    z:size/2,
    transform: new Pre3d.Transform(),
    s: function(){
      return 'position: '+cubePosition.getPosition();
    },
    getPosition: function(){
      var p = [];
      p[0] = Math.round(cubePosition.x - size/2);
      p[1] = Math.round(cubePosition.z - size/2);
      return p;
    },
    reset: function(){
      cubePosition.x = size/2;
      cubePosition.y = size/2;
      cubePosition.z = size/2;
    },
    resetRotation: function(){
      cubeposition.transform = new Pre3d.Transform();
    }
  };
  function onEndMove(){
    checkGoal();
    checkDanger();
    checkLevelComplete();
    if (ddbugg){
      console.log(cubePosition.s());
    }
  }
  function _moveCube(frame){
    if (frame % move.duration === move.duration-1){
      move._ticker.stop();
      onEndMove();
    }
    moveCube(move.heading, size/move.duration, Math.PI/(2*move.duration));
  }
  function moveCube(direction,distance, angle){
    // if (rotationFrameCount <= rotationSpeed){
      // rotationFrameCount += 1;
      // transform.rotateX(Math.PI/(2*rotationSpeed));
    // }else{
      // rotationFrameCount = 0;
      // rotating = false;
    // }
    switch ( direction ){
      case "left": 
        cubePosition.z+= distance;
        cubePosition.transform.rotateX(angle);
        break;
      case "right": 
        cubePosition.z-= distance;
        cubePosition.transform.rotateX(-angle);
        break;
      case "back": 
        cubePosition.x+= distance;
        cubePosition.transform.rotateZ(-angle);
        break;
      case "forward": 
        cubePosition.x-= distance;
        cubePosition.transform.rotateZ(angle);
        break;
    }
    draw();
  }
  var move = {
    heading: 'left',
    duration: 10,
    FPS: 30,
    init: function(){
      move._ticker = new DemoUtils.Ticker(move.FPS, _moveCube);
    },
    _setHeading: function(heading){move.heading = heading;},
    isMoving: function(){return move._ticker.isRunning();},
    left: function(){
      move._setHeading('left'); 
      move._ticker.start(); 
    },
    right: function(){
      move._setHeading('right'); 
      move._ticker.start(); 
    },
    forward: function(){
      move._setHeading('forward'); 
      move._ticker.start(); 
    },
    back: function(){
      move._setHeading('back'); 
      move._ticker.start(); 
    }
  };



  var screen_canvas = document.getElementById('indorfun');
  var renderer = new Pre3d.Renderer(screen_canvas);

  var cur_white = false;  // Default to black background.
  function drawGrid(){
    renderer.transform.reset();
    renderer.ctx.setStrokeColor(0, 66/255, 99/255, 1);
    renderer.ctx.lineWidth = 2;
    var grid ={
      x: [0, 1*size, 2*size, 3*size, 4*size, 5*size, 6*size, 7*size, 8*size, 9*size],
      z: [0, 1*size, 2*size, 3*size, 4*size, 5*size, 6*size, 7*size, 8*size, 9*size],
      y: [0]
    }
    grid.zStart = grid.z[0];
    grid.zEnd = grid.z[grid.z.length-1];
    grid.xStart = grid.x[0];
    grid.xEnd = grid.x[grid.x.length-1];
    var  gridLine;

      
    
    //loop over mthe z's to draw the X lines from zstart to zend
    for (var i = 0; i < grid.z.length; ++i) {
      p0 = {
        x: grid.xStart,
        y: grid.y[0],
        z: grid.z[i]
      };
      p1 = {
        x: grid.xEnd,
        y: grid.y[0],
        z: grid.z[i]
      };
      gridLine = Pre3d.PathUtils.makeLine(p0, p1);
      renderer.drawPath(gridLine);
    }
    //loop over the x's to draw the Z lines from xstart to xend
    for (var i = 0; i < grid.z.length; ++i) {
      p0 = {
        x: grid.x[i],
        y: grid.y[0],
        z: grid.zStart
      };
      p1 = {
        x: grid.x[i],
        y: grid.y[0],
        z: grid.zEnd
      };
      gridLine = Pre3d.PathUtils.makeLine(p0, p1);
      renderer.drawPath(gridLine);
    }

  }
  function setupFace(texture_image){
    var w = texture_image.width;
    var h = texture_image.height;

    var texinfo = new Pre3d.TextureInfo();
    texinfo.image = texture_image;
    texinfo.u0 = 0;
    texinfo.v0 = 0;
    texinfo.u1 = 0;
    texinfo.v1 = h;
    texinfo.u2 = w;
    texinfo.v2 = h;
    texinfo.u3 = w;
    texinfo.v3 = 0;

    function selectTexture(quad_face, quad_index, shape) {
      // Each face is two triangles, the newly triangulated triangles last.
      if (shape.quads.length > 3){
        renderer.texture = texinfo ;
        return false;
      }
      return false;
    }
    renderer.quad_callback = selectTexture;
  }
  function drawCubes(){
    var cubes = [ ];
    var cube = Pre3d.ShapeUtils.makeCube(size/2);
    color = boxColor;
    renderer.transform.reset();
    var transform = cubePosition.transform.dup();
    transform.translate (cubePosition.x, cubePosition.y, cubePosition.z);
    cubes.push({
      shape: cube,
      color: color,
      trans: transform
    });
    var num_cubes = cubes.length;
    // renderer.stroke_rgba = edgeColor;
      
    for (var i = 0; i < num_cubes; ++i) {
      cube = cubes[i];
      renderer.fill_rgba = cube.color;
      renderer.transform = cube.trans;
      renderer.bufferShape(cube.shape);
    }
  }
  function checkSquare(squares, onSuccess){
    var num_squares = squares.length; 
    var currentPos = cubePosition.getPosition();
    for (i=0; i<num_squares; ++i){
      square = squares[i];
      
      if (square.coord[0]*size == currentPos[0] && square.coord[1]*size == currentPos[1]){
        if (ddbugg){
          console.log('matched');
        }
        if (square.active !==0){
          onSuccess();
          if (square.active === 1){
            square.active = 0;
          }
        }
      }
    }
  }
  function drawSquares(squares, color){
    var num_squares = squares.length; 
    renderer.transform.reset();
    // renderer.stroke_rgba = edgeColor;
    for (i=0; i<num_squares; ++i){
      square = squares[i];
      renderer.fill_rgba = (square.active === 1 ? color.active:(square.active === 0 ? color.inactive: color.active));
      renderer.transform.reset();
      renderer.transform.translate(square.coord[0]*size, 0, square.coord[1]*size);
      plane = Pre3d.ShapeUtils.makePlane(
          { x: 0, y: 0, z: 0 },
          { x: 0, y:0, z: size },
          { x: size, y:0, z: size },
          { x: size, y:0, z:0 }
        );
      renderer.bufferShape(plane);
    }
  }
  function checkGoal(){
    checkSquare(goals, function(){
      score+=goalScore;
    });
  }
  function drawGoals(){
    drawSquares(goals, {active: goalColor, inactive: doneGoalColor});
  }
  function checkDanger(){
    checkSquare(dangers, function(){
      score+=dangerScore;
      cubePosition.reset();
    });
  }
  function drawDangers(){
    drawSquares(dangers, {active: dangerColor, inactive: dangerColor});
  }
  function drawText(){
    var ctx = renderer.ctx;
    ctx.save();
    ctx.font = 'bold 20px sans-serif';
    ctx.strokeStyle = 'rgba(0, 255, 255, 1)';
    ctx.fillStyle = 'rgba(0, 255, 255, 1)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    var centreX = 20;
    var centreY = 20;
    ctx.fillText("score: "+score.toString(), centreX, centreY);
    ctx.fillText(statusText, centreX, centreY+20);
    ctx.restore();
  }
  function checkLevelComplete(){
    var sum = 0;
    for ( var i in goals ){
      sum += goals[i].active;
    }
    if (sum === 0){
      cubePosition.reset();
      for ( var i in goals ){
        goals[i].active = 1;
      }
    }

  }

  function draw() {

    if (cur_white) {
      renderer.ctx.setFillColor(0.9, 0.9, 0.9, 1);
    } else {
      renderer.ctx.setFillColor(0.1, 0.1, 0.1, 1);
    }
    renderer.drawBackground();
    drawGoals();
    drawDangers();
    drawGrid();
    drawCubes();
    drawText();
     
    

    renderer.drawBuffer();
    renderer.emptyBuffer();
  }

  renderer.camera.focal_length = 3.0;
  // Have the engine handle mouse / camgera movement for us.
  //
  // function autoCamera(renderer, ix, iy, iz, tx, ty, tz, draw_callback, opts) 
  DemoUtils.autoCamera(renderer, 2, 2, -30, 0.50, -1.06, 0, draw);

  move.init();
  document.addEventListener('keydown', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!move.isMoving()){
      if (e.keyCode == 40){ //down
        move.back();
        score+=movePenalty;
      }
      if (e.keyCode == 38){ //up
        move.forward();
        score+=movePenalty;
      }
      if (e.keyCode == 37){ //left
        move.left();
        score+=movePenalty;
      }
      if (e.keyCode == 39){ //right
        move.right();
        score+=movePenalty;
      }
    }
    if (e.keyCode != 84)  // t  38 up, 40 down, , 37 left, 39 right
      return;

    if (cur_white) {
      document.body.className = "black";
    } else {
      document.body.className = "white";
    }
    cur_white = !cur_white;
    draw();
  }, false);

  draw();
  

  //setup face?
  // var img = new Image();
  // img.onload = function() { setupFace(img); };
  // img.src = 'http://media03.linkedin.com/mpr/mpr/shrink_80_80/p/1/000/0b4/251/0e84436.jpg';
}, false);

