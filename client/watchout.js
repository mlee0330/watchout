var boardHeight = 600;
var boardWidth = 800;
var gameStats = {
  score: 0,
  highScore: 0,
  collisions: 0
};

var gameModes = {
  addEnemy: false,
  addRadius: false,
  speedUp: false,
  hunter: false,
  nightmare: false
};

var enemyRadius = 10;
var playerRadius = 20;
var updateTime = 2000;

//
// Background
// 

var body = d3.select('body');
var board = body.append('svg')
                .attr('width', boardWidth)
                .attr('height', boardHeight)
                .attr('class', 'gameboard');

//
// Player
//

var drag = d3.behavior.drag()
             .on('dragstart', function() { player.style('fill', 'purple'); })
             .on('drag', function() { 
                // prevent player from going outside bounds
                player.attr('cx', function() {
                      if (d3.event.x > boardWidth - playerRadius) {
                        return boardWidth - playerRadius;
                      } else if (d3.event.x < playerRadius) {
                        return playerRadius;
                      } else {
                        return d3.event.x;
                      }
                    })
                      .attr('cy', function() {
                        if (d3.event.y > boardHeight - playerRadius) {
                          return boardHeight - playerRadius;
                        } else if (d3.event.y < playerRadius) {
                          return playerRadius;
                        } else {
                          return d3.event.y;
                        }
                      });})
             .on('dragend', function() {player.style('fill', 'white');});

var player = board.selectAll('.draggableCircle')
                 .data([{ x: (boardWidth / 2), y: (boardHeight/2), r: playerRadius}])
                 .enter()
                 .append("circle")
                 .attr('class', 'draggableCircle')
                 .attr('cx', function(d) { return d.x; })
                 .attr('cy', function(d) { return d.y; })
                 .attr('r', function(d) { return d.r; })
                 .call(drag)
                 .style('fill', 'white');

//
// Enemy
//

var Enemy = function(x, y) {
  this.x = x;
  this.y = y;
};

Enemy.prototype.move = function() {
  this.x = Math.floor(Math.random() * boardWidth);
  this.y = Math.floor(Math.random() * boardHeight);
};

Enemy.prototype.hunterMove = function() {
  var playerX = parseFloat(player.attr('cx'));
  var playerY = parseFloat(player.attr('cy'));
  this.x = Math.floor(playerX + (Math.random() * 800) - 400);
  this.y = Math.floor(playerY + (Math.random() * 800) - 400);
};

// create array of enemies
var enemies = [];

var newEnemies = function() {
  for (var i = 0; i < 10; i++) {
    var enemy = new Enemy(i*20+20, i*20+20);
    enemies.push(enemy);
  }
};

newEnemies();

// add enemies to board
var enemyCircles = board.selectAll(".enemy")
                        .data(enemies)
                        .enter()
                        .append("circle")
                        .attr("class", "enemy");

var enemyCirclesAttributes = board.selectAll(".enemy")
                            .attr("cx", function(d) { return d.x; })
                            .attr("cy", function(d) { return d.y; })
                            .attr("r", enemyRadius)
                            .attr("class", "enemy")
                            .style("fill", "red");

var addEnemy = function() {
  var enemy = new Enemy(0,0);
  enemy.move();
  enemies.push(enemy);
};

//
// Update
//

var update = function() {
  // Enter new enemies
  board.selectAll(".enemy")
      .data(enemies)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", enemyRadius)
      .attr("class", "enemy")
      .style("fill", "red");  

  if (gameModes.hunter) {
    // for (var i = 0; i < enemies.length; i++) {
    //   enemies[i].move();
    // }

    // board.selectAll(".enemy")
    //     .transition()
    //     .ease('linear')
    //     .duration(100)
    //     .tween('custom', collisionDetectionTween)
    //     .attr("r", enemyRadius)
    //     .attr("cx", function(d) { return d.x; })
    //     .attr("cy", function(d) { return d.y; });

    for (var i = 0; i < enemies.length; i++) {
      enemies[i].hunterMove();
    }

    board.selectAll(".enemy")
        .transition()
        .duration(updateTime/2 - 50)
        
        .tween('custom', collisionDetectionTween)
        .attr("r", enemyRadius)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });        
  setTimeout(update, updateTime/2 );
  } else {
    for (var i = 0; i < enemies.length; i++) {
      enemies[i].move();
    }

    board.selectAll(".enemy")
        .transition()
        .duration(updateTime - 50)
        .tween('custom', collisionDetectionTween)
        .attr("r", enemyRadius)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  setTimeout(update, updateTime);
  }
  player.immune = false;
};

//
// Collision detection
//
var checkCollision = function(enemy, callback) {

  var radiusSum = parseFloat(enemy.attr('r')) + parseFloat(player.attr('r'));
  var xDiff = parseFloat(enemy.attr('cx')) - parseFloat(player.attr('cx'));
  var yDiff = parseFloat(enemy.attr('cy')) - parseFloat(player.attr('cy'));

  var separation = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
  if (separation < radiusSum) {
    callback();
  }
};

var onCollision = function() {
  resetScore();

  gameStats.collisions++;
  player.immune = true;
  enemyRadius = 10;
  updateTime = 2000;
  enemies = [];
  board.selectAll(".enemy").data(enemies).exit().remove();
  newEnemies();
};


var collisionDetectionTween = function(endData, i) {
  var enemy = d3.select(this);
  var startPosition = {
    x: parseFloat(enemy.attr('cx')),
    y: parseFloat(enemy.attr('cy'))
  };

  return function(t) {

    if (!player.immune) {
      checkCollision(enemy, onCollision);
    }
    var enemyNextPos = {
      x: startPosition.x + (endData.x - startPosition.x) * t,
      y: startPosition.y + (endData.y - startPosition.y) * t
    };
    return enemy.attr('cx', enemyNextPos.x)
                .attr('cy', enemyNextPos.y);
  };
};

//
// Scoring
//

var increaseScore = function() {
  var scorePerTick = 1;
  if (gameModes.nightmare) {
    scorePerTick *= 5;
  } else {
    if (gameModes.addEnemy) {
      scorePerTick *= 1.5;
    }
    if (gameModes.addRadius) {
      scorePerTick *= 1.5;
    }
    if (gameModes.speedUp) {
      scorePerTick *= 1.5;
    }
  }
  if (gameModes.hunter) {
    scorePerTick *= .7;
  }
  gameStats.score += scorePerTick;
  updateScore();
};

var updateScore = function() {
  d3.select('#current-score')
    .text(parseInt(gameStats.score.toString()));
  d3.select('#collision-count')
    .text(gameStats.collisions.toString());
  d3.select('#highscore')
    .text(parseInt(gameStats.highScore.toString()));
};


var resetScore = function() {
  if (gameStats.highScore < gameStats.score) {
    gameStats.highScore = gameStats.score;
  }
  gameStats.score = 0;
};

//
// Start game
//

update();
setInterval(increaseScore, 50);

//
// Game modes
//
var toggleAdd = function() {
  resetScore();
  gameModes.addEnemy = !gameModes.addEnemy;
  if (gameModes.addEnemy) {
    $('#toggleAdd').css("background", "green");
  } else {
    $('#toggleAdd').css("background", "red");
  }
};
var toggleRadius = function() {
  resetScore();
  gameModes.addRadius = !gameModes.addRadius;
  if (gameModes.addRadius) {
    $('#toggleRadius').css("background", "green");
  } else {
    $('#toggleRadius').css("background", "red");
  }
};
var toggleSpeed = function() {
  resetScore();
  gameModes.speedUp = !gameModes.speedUp;
  if (gameModes.speedUp) {
    $('#toggleSpeed').css("background", "green");
  } else {
    $('#toggleSpeed').css("background", "red");
  }
};
var toggleNightmare = function() {
  resetScore();
  gameModes.nightmare = !gameModes.nightmare;
  if (gameModes.nightmare) {
    $('#toggleNightmare').css("background", "green");
  } else {
    $('#toggleNightmare').css("background", "red");
  }
};
var toggleHunterMode = function() {
  resetScore();
  gameModes.hunter = !gameModes.hunter;
  if (gameModes.hunter) {
    $('#toggleHunterMode').css("background", "green");
  } else {
    $('#toggleHunterMode').css("background", "red");
  }
};

var gameModeChanges = function() {
  if (gameModes.addEnemy || gameModes.nightmare) {
  console.log('game mode changes');
    addEnemy();
  }
  if (gameModes.addRadius || gameModes.nightmare) {
    enemyRadius += 5;
  }
  if (gameModes.speedUp || gameModes.nightmare) {
    updateTime -= 200;
  }
};
setInterval(gameModeChanges, 3000);

