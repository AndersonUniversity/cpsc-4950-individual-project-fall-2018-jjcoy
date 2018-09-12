/* pong.js
 * Jennifer Coy, August 2018
 * To recreate the Atari-style game of Pong, in the browser
 * Inspiration:  https://www.w3schools.com/graphics/game_intro.asp
 */

// game objects
var leftPaddle;         // the left pong paddle
var rightPaddle;        // the right side pong paddle
var ball;               // the pong ball

// dimensions
var screenx = 480;      // x dimension of screen
var screeny = 270;      // y dimension of screen
var offset_x = 10;      // x offset from edge of canvas
var paddleWidth = 10;   // width of each paddle
var paddleHeight = 75;  // height of each paddle
var balldim = 20;       // dimensions of the square ball

// Called when the body of the html file is loaded
function startGame() {

    // call the function in the PongGame object to initialize the game
    PongGame.start();

    // left paddle starts left side top
    // constructor call is in order: width, height, color, x, y positions
    leftPaddle = new Component(paddleWidth, paddleHeight, "red", offset_x, 0);

    // right paddle starts right side bottom
    rightPaddle = new Component(paddleWidth, paddleHeight, "blue",
        screenx - offset_x - paddleWidth, screeny - paddleHeight);

    // ball starts in the middle, moving with an initial velocity
    ball = new Component(balldim, balldim, "black", screenx/2.0, screeny/2.0);
    ball.speedX = 3;
    ball.speedY = 0;
}

// class for the game area
var PongGame = {

    // create the canvas through a call to the document object (built into JavaScript)
    canvas : document.createElement("canvas"),

    // function to start game
    start : function() {
        // set the size of canvas
        this.canvas.width = screenx;
        this.canvas.height = screeny;

        // get access to the canvas context, so we can draw on it
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        // over time, call updateGameArea frequently (50 times per second, every 20 ms)
        this.interval = setInterval(updateGameArea, 20);

        // if the user presses a key, copy the code into the key variable in this class
        // multiple keys allowed at one time
        window.addEventListener('keydown', function (e) {
            PongGame.keys = (PongGame.keys || []);
            PongGame.keys[e.keyCode] = true;
        })

        window.addEventListener('keyup', function (e) {
            PongGame.keys[e.keyCode] = false;
        })

        // for only one keypress at a time:
        /*window.addEventListener('keydown', function (e) {
            PongGame.key = e.keyCode;
        })
        window.addEventListener('keyup', function (e) {
            PongGame.key = false;
        })*/
    },

    // function to clear screen between redrawings
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // function to stop the animations (end the game)
    stop : function() {
        clearInterval(this.interval);
    }
};

// function to create a Component (paddle, ball)
function Component(width, height, color, x, y) {
    // transfer passed arguments to the class variables
    this.width = width;         // size
    this.height = height;
    this.x = x;                 // position (measured from upper left corner)
    this.y = y;
    this.speedX = 0;            // speed
    this.speedY = 0;

    // function to update this item (i.e. draw it)
    // it is a rectangle shape
    this.update = function() {
        ctx = PongGame.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    // update the position, based on speed
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
    };

    // collision detection between two objects -- do they touch?
    this.crashWith = function(otherobj) {

        // where are this object's edges?
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);

        // where are the other object's edges?
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);

        // do they overlap?
        var crash = true;
        if ((mybottom < othertop) ||
            (mytop > otherbottom) ||
            (myright < otherleft) ||
            (myleft > otherright)) {
            crash = false;
        }

        // true if overlap (collide), false otherwise
        return crash;
    }
}

// function to redraw the game area every few milliseconds
function updateGameArea() {

    // detect if two objects crashed together
    if (leftPaddle.crashWith(ball) || (rightPaddle.crashWith(ball))) {
        // if we had a collision, stop
        // TODO:  we actually want the ball to bounce here!
        // TODO:  we also need to detect if the ball went over the top of the screen
        PongGame.stop();
    } else {  // no collision, so redraw the screen and move everything
        // clear the screen
        PongGame.clear();

        // handle the left Paddle update
        leftPaddle.speedX = 0;
        leftPaddle.speedY = 0;

        // if the user presses the a or z keys
        // (keycodes can be found at http://keycode.info/)
        // TODO:  These numbers should be constants instead of hard-coded
        if (PongGame.keys && PongGame.keys[65]) {
            leftPaddle.speedY = -1;
        }
        if (PongGame.keys && PongGame.keys[90]) {
            leftPaddle.speedY = 1;
        }
        leftPaddle.newPos();    // move it
        leftPaddle.update();    // draw it

        // handle the right paddle update
        rightPaddle.speedX = 0;
        rightPaddle.speedY = 0;
        // if the user presses the up/down arrow keys, move this one
        if (PongGame.keys && PongGame.keys[38]) {
            rightPaddle.speedY = -1;
        }
        if (PongGame.keys && PongGame.keys[40]) {
            rightPaddle.speedY = 1;
        }
        rightPaddle.newPos();       // move it
        rightPaddle.update();       // draw it

        // handle the ball update
        ball.newPos();              // move it
        ball.update();              // draw it
    }
}