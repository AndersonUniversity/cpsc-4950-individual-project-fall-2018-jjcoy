/**
 * @fileOverview To recreate the Atari-style game of Pong, in the browser
 * Inspiration:  https://www.w3schools.com/graphics/game_intro.asp
 * @author Jennifer Coy
 * @date August 2018
 */

/** the left pong paddle object */
let leftPaddle;
/** the right pong paddle object */
let rightPaddle;
/** the ball object */
let ball;
/** left edge of screen */
let leftEdge;
/** right edge of screen */
let rightEdge;
/** top edge of screen */
let topEdge;
/** bottom edge of screen */
let bottomEdge;
/** game score */
let score = 0;
/** bounce count */
let bounces = 0;
/** paddleBounceEffect the current max size of the speed change */
let paddleBounceEffect = 1;

/** @const {number} SCREEN_X x dimension of screen */
const SCREEN_X = 480;
/** @const {number} SCREEN_Y y dimension of screen */
const SCREEN_Y = 270;
/** @const {number} OFFSET_X x offset from edge of canvas */
const OFFSET_X = 10;
/** @const {number} PADDLE_WIDTH width of the paddles */
const PADDLE_WIDTH = 10;
/** @const {number} PADDLE_HEIGHT height of the paddles */
const PADDLE_HEIGHT = 75;
/** @const {number} BALL_DIM width/height of the square ball */
const BALL_DIM = 20;
/** @const {number} BALL_SPEED the speed of the ball */
const BALL_SPEED = 2;
/** @const {number} RANDOM_EFFECT the max size of initial randomness added */
const RANDOM_EFFECT = 4;
/** @const {number} PADDLE_SPEED the speed of the paddle */
const PADDLE_SPEED = 3;
/** @const {number} A_KEY the keycode of the 'a' key */
const A_KEY = 65;
/** @const {number} Z_KEY the keycode of the 'z' key */
const Z_KEY = 90;
/** @const {number} UP_KEY the keycode of the up arrow key */
const UP_KEY = 38;
/** @const {number} DOWN_KEY the keycode of the down arrow key */
const DOWN_KEY = 40;
/** @const {string} PADDLE_COLORS the colors of the paddles */
const PADDLE_COLORS = 'grey';
/** @const {string} BALL_COLOR the color of the ball */
const BALL_COLOR = 'grey';
/** @CONST {STRING} SCORE_COLOR the color of the score text */
const SCORE_COLOR = 'blue';
/** @const {number} SCORE_INCREMENT the number of bounces per point */
const SCORE_INCREMENT = 1;
/** @const {number} SPEED_INCREMENT the number of bounces per speed increase */
const SPEED_INCREMENT = 1;

/**
 * Sets up the game canvas and components of the game.
 * Called when the body of the html file is loaded.
 */
function startGame() {
  // call the function in the PongGame object to initialize the game
  PongGame.start();

  // left paddle starts left side top
  leftPaddle = new Component(PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_COLORS, OFFSET_X, 0);

  // right paddle starts right side bottom
  rightPaddle = new Component(PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_COLORS,
      SCREEN_X - OFFSET_X - PADDLE_WIDTH, SCREEN_Y - PADDLE_HEIGHT);

  // ball starts in the middle, moving with an initial velocity
  ball = new Component(BALL_DIM, BALL_DIM, BALL_COLOR, SCREEN_X/2.0, SCREEN_Y/2.0);
  ball.speedX = BALL_SPEED;
  ball.speedY = getRandomValue() * RANDOM_EFFECT;  // random Y speed

  // create left and right boundaries, which are not drawn, just used
  // to detect if ball reaches the edge
  leftEdge = new Component(1, SCREEN_Y, 'black', -1, 0);
  rightEdge = new Component(1, SCREEN_Y, 'black', SCREEN_X+1, 0);

  // create top and bottom boundaries, which are not drawn, but
  // used to detect if the ball bounces off the top/bottom
  topEdge = new Component(SCREEN_X, 1, 'black', 0, -1);
  bottomEdge = new Component(SCREEN_X, 1, 'black', 0, SCREEN_Y-1);
}

/**
 * Generate a random number between -1 and 1
 * @return {number} A random number between -1 and 1
 */
function getRandomValue() {
  let randVal = Math.random();  // random number between 0 and 1
  // randomly go up or down (random() returns a number between 0 and 1)
  if ((Math.random() < 0.5)) {
    randVal = -randVal;
  }
  // return the result
  return randVal;
}

/**
 * @class Represents the Pong game canvas and actions.
 */
let PongGame = {
  /** the rectangular HTML element that is our game play area */
  canvas : document.createElement('canvas'), // create the canvas

  /**
   * Initializes the elements needed for the game
   */
  start : function() {
    // set the size of canvas
    this.canvas.width = SCREEN_X;
    this.canvas.height = SCREEN_Y;

    // get access to the canvas context, so we can draw on it
    this.context = this.canvas.getContext('2d');
    // insert the canvas into the DOM at the end, after the title
    document.body.insertBefore(this.canvas, document.body.nextSibling);

    // over time, call updateGameArea frequently
    // (50 times per second, every 20 ms)
    this.interval = setInterval(updateGameArea, 20);

    // if the user presses a key, copy the code into the
    // key variable in this class
    // multiple keys are allowed at one time
    window.addEventListener('keydown', function (e) {
      PongGame.keys = (PongGame.keys || []);
      PongGame.keys[e.keyCode] = true;
    });

    window.addEventListener('keyup', function (e) {
      PongGame.keys[e.keyCode] = false;
    });
  }, // end of start() function

  /**
   * Clear screen between updates
   */
  clear : function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

  /**
   * Stop the animations (end the game)
   */
  stop : function() {
    clearInterval(this.interval);
    // TODO: Add end of game message
  }
}; // the PongGame class

/**
 * @class Represents rectangular shaped component such as a paddle or ball,
 * which can draw itself (update()), move itself (newPos()), and detect a
 * collision with other Components (collidesWith()).
 * @param {number} width The width of the rectangle
 * @param {number} height The height of the rectangle
 * @param {string} color The color to fill the rectangle
 * @param {number} x The initial x position of the upper left corner
 * @param {number} y The initial y position of the upper left corner
 */
function Component(width, height, color, x, y) {
  /** @type {number} width The width of this component */
  this.width = width;
  /** @type {number} height The height of this component */
  this.height = height;
  /** @type {number} x The x position of top left edge */
  this.x = x;
  /** @type {number} y The y position of the top left edge */
  this.y = y;
  /* @type {number} speedX The x speed that it is moving */
  this.speedX = 0;
  /** @type {number} speedY The y speed that it is moving */
  this.speedY = 0;

  /**
   * Update this rectangular object by redrawing it at it's current position
   */
  this.update = function() {
    /** @type {CanvasRenderingContext2D | WebGLRenderingContext | *}
     *        the canvas representing the game board
     */
    let ctx = PongGame.context;  // get access to the canvas

    // draw a rectangle
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };

  /**
   * Change the position, passed on the speed:  x = x0 + vo t + 0.5 a t^2
   * where t = 1 time tick, and a = 0 (or velocity is changed manually)
   */
  this.newPos = function() {
    // move the object's position
    this.x += this.speedX;
    this.y += this.speedY;

    // see if reached top or bottom edges of screen
    if (this.y < 0) {
      this.y = 0;
    } else if (this.y > (SCREEN_Y - this.height)) { // bottom edge
      this.y = SCREEN_Y - this.height;
    }
  };

  /**
   * Collision detection between two objects -- do they touch?
   * @param otherObj The other object to determine if they overlap
   * @returns {boolean} True if the two objects collide.
   */
  this.collidesWith = function(otherObj) {

    // where are this object's edges?
    /** @type {number} myLeft The left edge of this object */
    let myLeft = this.x;
    /** @type {number} myRight The right edge of this object */
    let myRight = this.x + (this.width);
    /** @type {number} myTop The top edge of this object */
    let myTop = this.y;
    /** @type {number} myBottom The bottom edge of this object */
    let myBottom = this.y + (this.height);

    // where are the other object's edges?
    /** @type {number} otherLeft The left edge of the other object */
    let otherLeft = otherObj.x;
    /** @type {number} otherRight The right edge of the other object */
    let otherRight = otherObj.x + (otherObj.width);
    /** @type {number} otherTop The top edge of the other object */
    let otherTop = otherObj.y;
    /** @type {number} otherBottom The bottom edge of the other object */
    let otherBottom = otherObj.y + (otherObj.height);

    // do they overlap?
    let crash = true;
    if ((myBottom < otherTop) || (myTop > otherBottom) ||
        (myRight < otherLeft) || (myLeft > otherRight)) {
      crash = false;
    }

    // true if overlap (collide), false otherwise
    return crash;
  };

  /**
   * Reverse direction, as if it is bouncing off a paddle.
   */
  this.paddle_bounce = function() {
    // TODO:  Locate bug that causes occasional multi-bounces off a paddle

    // change the speed randomly
    this.speedX += Math.random() * paddleBounceEffect;
    // reverse directions in X
    this.speedX = 0-this.speedX;
    // need to back the ball up, or it will get into an infinite
    // loop of collisions!
    this.x += this.speedX;
    // change the Y speed randomly, but do not reverse direction
    this.speedY += Math.random() * paddleBounceEffect;
    // back the ball up
    this.y += this.speedY;
  };

  /**
   * Reverse y direction, as if it is bouncing off the top/bottom.
   */
  this.wall_bounce = function() {
    // reverse the y speed
    // if it was going down (positive speed) it will now be
    // going up (negative speed), and vice versa
    this.speedY = 0-this.speedY;
    // back the ball away from the wall
    // if speed WAS negative (moving towards top wall), the speed will
    // be positive now, and we want to move it down, so just add it
    // if the speed WAS positive (moving towards bottom wall), the
    // the speed is now negative, so add it to move up.
    this.y += this.speedY;

  };
}

/**
 * Redraw the game area every few milliseconds
 */
function updateGameArea() {
  // see if we had collisions, or can just redraw
  if (leftPaddle.collidesWith(ball) || (rightPaddle.collidesWith(ball))) {
    // detect if two objects crashed together
    // if we had a collision, paddle_bounce
    ball.paddle_bounce();
    // count bounces
    bounces++;
    // add a point for every SCORE_INCREMENT bounces, then speed up
    if (bounces % SCORE_INCREMENT === 0) {
      score++;
    }
    // increase speed every few bounces
    if (bounces % SPEED_INCREMENT === 0) {
      paddleBounceEffect++;
    }
  } else if (ball.collidesWith(leftEdge) || ball.collidesWith(rightEdge)) {
    // ball went off the left or right edge
    PongGame.stop();
  } else if (ball.collidesWith(topEdge) || ball.collidesWith(bottomEdge)) {
    // if the ball hits the top or bottom edge
    ball.wall_bounce();
  } else {
    // no collision, so redraw the screen and move everything
    // clear the screen
    PongGame.clear();

    ///////
    // Draw score
    ///////
    let ctx = PongGame.context;
    ctx.font = '24px Arial';
    ctx.fillStyle = SCORE_COLOR;
    ctx.textAlign = 'center';
    // note that string literals use back-single-quotes
    ctx.fillText(`Score ${score}`,SCREEN_X/2,30);

    ///////
    // Movement of the paddles
    ///////
    // handle the left Paddle update
    leftPaddle.speedX = 0;
    leftPaddle.speedY = 0;

    // if the user presses the a or z keys
    // (keycodes can be found at http://keycode.info/)
    if (PongGame.keys && PongGame.keys[A_KEY]) {
      leftPaddle.speedY = -PADDLE_SPEED;
    }
    if (PongGame.keys && PongGame.keys[Z_KEY]) {
      leftPaddle.speedY = PADDLE_SPEED;
    }
    leftPaddle.newPos();    // move it
    leftPaddle.update();    // draw it

    // handle the right paddle update
    rightPaddle.speedX = 0;
    rightPaddle.speedY = 0;
    // if the user presses the up/down arrow keys, move this one
    if (PongGame.keys && PongGame.keys[UP_KEY]) {
      rightPaddle.speedY = -PADDLE_SPEED;
    }
    if (PongGame.keys && PongGame.keys[DOWN_KEY]) {
      rightPaddle.speedY = PADDLE_SPEED;
    }
    rightPaddle.newPos();       // move it
    rightPaddle.update();       // draw it

    ///////
    // Movement of the ball
    ///////
    // handle the ball update
    ball.newPos();              // move it
    ball.update();              // draw it
  }
}