let video;
let poseNet;
let poses = [];

//canvas dimensions
var w = 640;
var h = 480;

//store nose point position
var keyposX;
var keyposY;

var barrier = new barrier();

var hit = false;

var score = 0;
var scoreDiv;

function setup() {
    //store into variable to center canvas
    var cam = createCanvas(w, h);
    cam.center();
    video = createCapture(VIDEO);
    video.size(width, height);

    //Score system
    scoreDiv = createDiv("Your Score: " + score);
    scoreDiv.id("scoreID");
    scoreDiv.position(0, 0);

    // Create a new poseNet method with a single detection
    poseNet = ml5.poseNet(video, modelReady);
    // This sets up an event that fills the global variable "poses"
    // with an array every time new poses are detected
    poseNet.on('pose', function (results) {
        poses = results;
    });
    // Hide the video element, and just show the canvas
    video.hide();
}

function modelReady() {
    select('#status').html('Model Loaded');
}

function draw() {
    //flip screen to mirror user
    translate(width, 0);
    scale(-1, 1);

    image(video, 0, 0, width, height);
    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();
    barrier.show();
    barrier.update();

    //detect collision between rectangle and nose point
    hit = collideRectCircle(barrier.x, barrier.y, barrier.width, barrier.height, keyposX, keyposY, 5);
    if (hit == true) {
        window.alert("You lose!");
        noLoop();
        console.log("hit detected!");
    }
}


// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        let pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j++) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            let keypoint = pose.keypoints[j];
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (keypoint.score > 0.2 && keypoint == pose.keypoints[0]) {
                fill(255, 0, 0);
                noStroke();
                keyposX = keypoint.position.x;
                keyposY = keypoint.position.y;
                ellipse(keyposX, keyposY, 10, 10);

            }
        }
    }
}

//generate rectangles from the left side of camera canvas
function barrier() {
    this.velocity = 8;
    this.height = Math.floor(Math.random() * 257);
    this.width = 40;
    this.x = w;
    this.y = Math.floor((Math.random() * h) + 10);
    this.show = function () {
        fill(color('blue'));
        rect(this.x, this.y, this.width, this.height);
    }
    //updates position and adds score
    this.update = function () {
        this.x -= this.velocity;
        if (this.x < (0 - this.width)) {
            this.x = w;
            this.y = Math.floor((Math.random() * h) + 10);
            this.width = Math.floor(Math.random() * 257);
            this.height = Math.floor(Math.random() * 257);
            score += 1;
            document.getElementById("scoreID").innerHTML = "Your Score: " + score;
        }
        //increases speed after reaching a score of 15
        else if (score == 15) {
            this.velocity = 10;
        }
    }
}