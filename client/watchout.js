// start slingin' some d3 here.

// TODO: Add an enemy
// TODO: Increase radius
// TODO: Nightmare mode
// TODO: CSS
// TODO: Speed up


var boardHeight = 600;
var boardWidth = 800;
var highScore = 0;
var currentScore = 0;
var collisions = 0;

//make background
var body = d3.select('body');
var board = body.append('svg')
                .attr('width', boardWidth)
                .attr('height', boardHeight);

var drag = d3.behavior.drag()
             .on('dragstart', function() { player.style('fill', 'purple'); })
             .on('drag', function() { player.attr('cx', d3.event.x)
                                            .attr('cy', d3.event.y);})
             .on('dragend', function() {player.style('fill', 'black');});
var player = board.selectAll('.draggableCircle')
                 .data([{ x: (boardWidth / 2), y: (boardHeight/2), r: 20}])
                 .enter()
                 .append("circle")
                 .attr('class', 'draggableCircle')
                 .attr('cx', function(d) { return d.x; })
                 .attr('cy', function(d) { return d.y; })
                 .attr('r', function(d) { return d.r; })
                 .call(drag)
                 .style('fill', 'black');

// define enemy
var Enemy = function(x, y) {
  this.x = x;
  this.y = y;
};

Enemy.prototype.move = function() {
  player.immune = false;
  this.x = Math.floor(Math.random() * boardWidth);
  this.y = Math.floor(Math.random() * boardHeight);
};

// create array of enemies
var enemies = [];
for (var i = 0; i < 10; i++) {
  var enemy = new Enemy(i*20, i*20);
  enemies.push(enemy);
}

// add enemies to board
var enemyCircles = board.selectAll("circle")
                        .data(enemies)
                        .enter()
                        .append("circle");
// TODO Add class to enemies for selections
var enemyCirclesAttributes = enemyCircles
                            .attr("cx", function(d) { return d.x; })
                            .attr("cy", function(d) { return d.y; })
                            .attr("r", 10)
                            .style("fill", "red");
// <circle></circle>


var addEnemy = function() {
  var enemy = new Enemy(0,0);
  enemies.push(enemy);
  // TODO: Clarify selections
  enemyCircles = board.selectAll("circle")
                          .data(enemies, function(d) { return d; });
  enemyCircles.enter()
              .append("circle");

  enemyCirclesAttributes = enemyCircles
                              .attr("cx", function(d) { return d.x; })
                              .attr("cy", function(d) { return d.y; })
                              .attr("r", 10)
                              .style("fill", "red");
}
var update = function() {
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].move();
  }
  enemyCirclesAttributes = enemyCircles
                            .transition()
                            .duration(1950)
                            .tween('custom', collisionDetectionTween)
                            .attr("cx", function(d) { return d.x; })
                            .attr("cy", function(d) { return d.y; });
}

var checkCollision = function(enemy, callback) {
  // check for collision
  // run callback if collision
  var radiusSum = parseFloat(enemy.attr('r')) + parseFloat(player.attr('r'));
  var xDiff = parseFloat(enemy.attr('cx')) - parseFloat(player.attr('cx'));
  var yDiff = parseFloat(enemy.attr('cy')) - parseFloat(player.attr('cy'));

  var separation = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
  if (separation < radiusSum) {
    callback();
  }
}

var onCollision = function() {
  if (gameStats.highScore < gameStats.score) {
    gameStats.highScore = gameStats.score;
  }
  gameStats.score = 0;

  gameStats.collisions++;
  player.immune = true;
}

var collisionDetectionTween = function(endData, i) {
  var enemy = d3.select(this);
  var startPosition = {
    x: parseFloat(enemy.attr('cx')),
    y: parseFloat(enemy.attr('cy'))
  };
  // endData.x = d3.scale.linear().domain([0,boardWidth]).range([0, 100])(endData.x);
  // endData.y = d3.scale.linear().domain([0,boardHeight]).range([0, 100])(endData.y);

  // console.log(JSON.stringify(endData));
  return function(t) {
    // happens every t where t = time between 0 and 1
    // console.log('t: ' + t);

    // run check collision function
    if (!player.immune) {
      checkCollision(enemy, onCollision);
    }
    var enemyNextPos = {
      x: startPosition.x + (endData.x - startPosition.x) * t,
      y: startPosition.y + (endData.y - startPosition.y) * t
    };
    return enemy.attr('cx', enemyNextPos.x)
                .attr('cy', enemyNextPos.y);
  }
}

var increaseScore = function() {
  gameStats.score += 489;
  updateScore();
};

var updateScore = function() {
  d3.select('#current-score')
    .text(gameStats.score.toString());
  d3.select('#collision-count')
    .text(gameStats.collisions.toString());
  d3.select('#highscore')
    .text(gameStats.highScore.toString());
};

var gameStats = {
  score: 0,
  highScore: 0,
  collisions: 0
};
update();

setInterval(update, 2000);
setInterval(increaseScore, 50);

/*
var tweenWithCollisionDetection;

tweenWithCollisionDetection = function(endData) {
  var endPos, enemy, startPos;
  enemy = d3.select(this);
  startPos = {
    x: parseFloat(enemy.attr('cx')),
    y: parseFloat(enemy.attr('cy'))
  };
  endPos = {
    x: axes.x(endData.x),
    y: axes.y(endData.y)
  };
  return function(t) {
    var enemyNextPos;
    checkCollision(enemy, onCollision);
    enemyNextPos = {
      x: startPos.x + (endPos.x - startPos.x) * t,
      y: startPos.y + (endPos.y - startPos.y) * t
    };
    return enemy.attr('cx', enemyNextPos.x).attr('cy', enemyNextPos.y);
  };
};
*/