var indorfun = {};

// indorfun.cube = function(){
  // var previousPosition;
  // var position = [];

// };


indorfun.equalCoordinates = function (coord1, coord2) {
  return coord1[0] === coord2[0] && coord1[1] === coord2[1];
};

indorfun.checkCoordinateInArray = function (coord, arr) {
  var isInArray = false;
  $.each(arr, function (index, item) {
    if (indorfun.equalCoordinates(coord, item)) {
      isInArray = true;
    }
  });
  return isInArray;
};

indorfun.game = (function () {
  var $canvas, canvas, ctx;
  var frameLength;
  var snake;
  var apple;
  var score;
  var timeout;
  indorfun.width = 600;
  indorfun.height = 600;
  indorfun.blockSize = 10;
  indorfun.widthInBlocks = indorfun.width / indorfun.blockSize;
  indorfun.heightInBlocks = indorfun.height / indorfun.blockSize;

  function init() {
    $canvas = $('#indorfun');
    if ($canvas.length === 0) {
      $('body').append('<canvas id="indorfun">');
    }
    $canvas = $('canvas');
    $canvas.attr('width', indorfun.width);
    $canvas.attr('height', indorfun.height);
    canvas = $canvas[0];
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "black";
    score = 0;
    frameLength = 500;
    snake = indorfun.snake();
    apple = indorfun.apple();
    bindEvents();
    gameLoop();
  }

  function gameLoop() {
    ctx.clearRect(0, 0, indorfun.width, indorfun.height);
    snake.advance(apple);
    draw();

    if (snake.checkCollision()) {
      snake.retreat(); //move snake back to previous position
      snake.draw(ctx); //draw snake in its previous position
      gameOver();
    }
    else {
      timeout = setTimeout(gameLoop, frameLength);
    }
  }

  function draw() {
    snake.draw(ctx);
    drawBorder();
    apple.draw(ctx);
    drawScore();
  }

  function drawScore() {
    ctx.save();
    ctx.font = 'bold 102px sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var centreX = indorfun.width / 2;
    var centreY = indorfun.width / 2;
    ctx.fillText(score.toString(), centreX, centreY);
    ctx.restore();
  }

  function gameOver() {
    ctx.save();
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    var centreX = indorfun.width / 2;
    var centreY = indorfun.width / 2;
    ctx.strokeText('Game Over', centreX, centreY - 10);
    ctx.fillText('Game Over', centreX, centreY - 10);
    ctx.font = 'bold 15px sans-serif';
    ctx.strokeText('Press space to restart', centreX, centreY + 15);
    ctx.fillText('Press space to restart', centreX, centreY + 15);
    ctx.restore();
  }

  function drawBorder() {
    ctx.save();
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = indorfun.blockSize;
    ctx.lineCap = 'square';
    var offset = ctx.lineWidth / 2;
    var corners = [
      [offset, offset],
      [indorfun.width - offset, offset],
      [indorfun.width - offset, indorfun.height - offset],
      [offset, indorfun.height - offset]
    ];
    ctx.beginPath();
    ctx.moveTo.apply(ctx, corners[3]);
    $.each(corners, function (index, corner) {
      ctx.lineTo.apply(ctx, corner);
    });
    ctx.stroke();
    ctx.restore();
  }

  function restart() {
    clearTimeout(timeout);
    $('body').unbind('keydown');
    $(indorfun).unbind('appleEaten');
    $(canvas).unbind('click');
    indorfun.game.init();
  }
  
  function bindEvents() {
    $(document).keydown(function (event) {
      switch (event.which) {
      case 37:
        snake.setDirection('left');
        event.preventDefault();
        break;
      case 38:
        snake.setDirection('up');
        event.preventDefault();
        break;
      case 39:
        snake.setDirection('right');
        event.preventDefault();
        break;
      case 40:
        snake.setDirection('down');
        event.preventDefault();
        break;
      case 32:
        restart();
        break;
      }
    });

    $(indorfun).bind('appleEaten', function (event, snakePositions) {
      apple.setNewPosition(snakePositions);
      score++;
      frameLength *= 0.99; //subtle speed-up
    });

    $(canvas).click(restart);
  }

  return {
    init: init
  };
})();

indorfun.apple = function () {
  var position = [6, 6];

  function draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#0a0'; //apple green
    ctx.beginPath();
    var radius = indorfun.blockSize / 2;
    var x = position[0] * indorfun.blockSize + radius;
    var y = position[1] * indorfun.blockSize + radius;
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  }

  function random(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
  }

  function getRandomPosition() {
    var x = random(1, indorfun.widthInBlocks - 2);
    var y = random(1, indorfun.heightInBlocks - 2);
    return [x, y];
  }

  function setNewPosition(snakeArray) {
    var newPosition = getRandomPosition();
    if (indorfun.checkCoordinateInArray(newPosition, snakeArray)) {
      return setNewPosition(snakeArray);
    }
    else {
      position = newPosition;
    }
  }

  function getPosition() {
    return position;
  }

  return {
    draw: draw,
    setNewPosition: setNewPosition,
    getPosition: getPosition
  };
};

indorfun.snake = function () {
  var previousPosArray;
  var posArray = [];
  posArray.push([6, 4]);
  posArray.push([5, 4]);
  var direction;
  var nextDirection = direction = 'right';

  function setDirection(newDirection) {
    var allowedDirections;

    switch (direction) {
    case 'left':
    case 'right':
      allowedDirections = ['up', 'down'];
      break;
    case 'up':
    case 'down':
      allowedDirections = ['left', 'right'];
      break;
    default:
      throw('Invalid direction');
    }
    if (allowedDirections.indexOf(newDirection) > -1) {
      nextDirection = newDirection;
    }
  }

  function drawSection(ctx, position) {
    ctx.save();
    ctx.fillStyle = '#33a';
    var x = indorfun.blockSize * position[0];
    var y = indorfun.blockSize * position[1];
    ctx.fillRect(x, y, indorfun.blockSize, indorfun.blockSize);
    ctx.restore();
  }

  function draw(ctx) {
    for(var i = 0; i < posArray.length; i++) {
      drawSection(ctx, posArray[i]);
    }
  }

  function checkCollision() {
    var wallCollision = false;
    var snakeCollision = false;
    var head = posArray[0]; //just the head
    var rest = posArray.slice(1); //the rest of the snake
    var snakeX = head[0];
    var snakeY = head[1];
    var minX = 1;
    var minY = 1;
    var maxX = indorfun.widthInBlocks - 1;
    var maxY = indorfun.heightInBlocks - 1;
    var outsideHorizontalBounds = snakeX < minX || snakeX >= maxX;
    var outsideVerticalBounds = snakeY < minY || snakeY >= maxY;

    if (outsideHorizontalBounds || outsideVerticalBounds) {
      wallCollision = true;
    }
    //check if the snake head coords overlap the rest of the snake
    snakeCollision = indorfun.checkCoordinateInArray(head, rest);
    return wallCollision || snakeCollision;
  }

  function advance(apple) {
    //make a copy of the head of the snake otherwise
    //the changes below would affect the head of the snake
    var nextPosition = posArray[0].slice();
    direction = nextDirection;
    switch (direction) {
    case 'left':
      nextPosition[0] -= 1;
      break;
    case 'up':
      nextPosition[1] -= 1;
      break;
    case 'right':
      nextPosition[0] += 1;
      break;
    case 'down':
      nextPosition[1] += 1;
      break;
    default:
      throw('Invalid direction');
    }

    previousPosArray = posArray.slice(); //save previous array
    posArray.unshift(nextPosition);
    if (isEatingApple(posArray[0], apple)) {
      $(indorfun).trigger('appleEaten', [posArray]);
    }
    else {
      posArray.pop();
    }
  }

  function isEatingApple(head, apple) {
    return indorfun.equalCoordinates(head, apple.getPosition());
  }

  function retreat() {
    posArray = previousPosArray;
  }

  return {
    draw: draw,
    advance: advance,
    retreat: retreat,
    setDirection: setDirection,
    checkCollision: checkCollision
  };
};


indorfun.game.init();

