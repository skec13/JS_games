////////////////////     canvas definitions     ////////////////////
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
////////////////////////////////////////////////////////////////////


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;

let score = 0;
let gameOver = false;
ctx.font = "50px Impact";


class Pointer {
    constructor(){
        this.width = 100;
        this.height = 100;
        this.image = new Image();
        this.image.src = "/Images/targetCursor.png";
    }
    update(x, y){
        this.x = x;
        this.y = y;
    }
    draw(){
        ctx.drawImage(this.image, this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }
}


////////////////////     constructing ravens     ////////////////////     
let ravens = [];  //here is let instead of const because we are using filter method later and will be redeclaring whole array

class Raven {
    constructor(){
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = "Images/raven.png";
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        
    }
    update(deltatime){
        if(this.y < 0 || this.y > canvas.height - this.height){
            this.directionY = this.directionY * -1;  //to bounce off top or bottom
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        
        this.timeSinceFlap += deltatime;
        if(this.timeSinceFlap > this.flapInterval){
            if(this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
        }
        if(this.x < 0 - this.width) gameOver = true;
        
        
    }
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}
////////////////////////////////////////////////////////////////////


////////////////////     constructing explosions     ////////////////////
let explosions = [];
class Explosion {
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = "Images/boom.png";
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = "Sounds/boom2.wav";
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }
    update(deltatime){
        if(this.frame === 0)this.sound.play();
        this.timeSinceLastFrame += deltatime;
        if(this.timeSinceLastFrame > this.frameInterval){
            this.frame++;
            this.timeSinceLastFrame = 0;
            if(this.frame > 5) this.markedForDeletion = true;
        }
    }
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size);
    }
}
/////////////////////////////////////////////////////////////////////////

function drawScore(){
    ctx.fillStyle = "black";
    ctx.fillText('Score: ' + score, 50, 75);
    ctx.fillStyle = "white";
    ctx.fillText('Score: ' + score, 55, 80);    
}

function drawGameOver(){
    ctx.textAlign = 'center';
    ctx.fillStyle = "black";
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2, canvas.height/2);
    ctx.fillStyle = "white";
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2 + 5, canvas.height/2 + 5);
}

const pointer = new Pointer();

window.addEventListener('mousemove', function(e){
    const mouseY = e.y;
    const mouseX = e.x;
    pointer.update(mouseX, mouseY);
});

window.addEventListener('click', function(e){
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    const pc = detectPixelColor.data; //array with rgba values of clicked pixel
    ravens.forEach(object =>{
       if(object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]){
           object.markedForDeletion = true;
           score++;
           explosions.push(new Explosion(object.x, object.y, object.width));
           
       } 
    });
});


function animate(timestamp){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltatime;
    if(timeToNextRaven > ravenInterval){
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort(function(a,b){
           return a.width - b.width;  //ravens array sorted by size 
        });
    };
    drawScore();
    pointer.draw();
    [...ravens, ...explosions].forEach(object => object.update(deltatime));  //will cycle through ravens array and trigger update method on all of them
    [...ravens, ...explosions].forEach(object => object.draw()); //...ravens is a spread operator
    ravens = ravens.filter(object => !object.markedForDeletion);  //creates a new array with only elements matcing the filter conditions-markedForDeletion == true
    explosions = explosions.filter(object => !object.markedForDeletion);
    if(!gameOver) requestAnimationFrame(animate);
    else drawGameOver();
}

animate(0);  //timestamp set to 0, otherwise first timestamp in a NaN