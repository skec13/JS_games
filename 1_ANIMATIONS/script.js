import data from "/1_ANIMATIONS/DATA/animation.json" assert {type: 'json'};  //importing local JSON

let playerState = "dizzy";
const dropdown = document.getElementById("animations");
dropdown.addEventListener('change', function(e){
   playerState = e.target.value;
});

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
console.log(ctx);

const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;

const playerImage = new Image();
playerImage.src = '/1_ANIMATIONS/IMAGES/shadow_dog.png';

let sw = 700;
let sh = 700;

const spriteWidth = 575; //shadow_dog.png is 6876px with 12 columns-->6876/12=573
const spriteHeight = 523; //5230/10 rows = 523

let gameFrame = 0; //speed of refreshing
const staggerFrames = 5;  //5 times slower than normal

const animationStates = data;
console.log(animationStates);
const spriteAnimations = [];

animationStates.forEach((state, index) => {
    let frames = {
        loc: [],
        
    }
    for(let j = 0; j < state.frames; j++){
        let positionX = j * spriteWidth;
        let positionY = index * spriteHeight;
        frames.loc.push({x: positionX, y: positionY});
    }
    spriteAnimations[state.name] = frames;
});

console.log(spriteAnimations);

function animate(){
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    let position = Math.floor(gameFrame/staggerFrames) % spriteAnimations[playerState].loc.length; //loops 0 to 5 
    let frameX = spriteWidth * position;
    let frameY = spriteAnimations[playerState].loc[position].y;
    
    //ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    //sx,sy,sw,sh which part to cut out off shadow_dog.png, other values for position 
    ctx.drawImage(playerImage, frameX, frameY, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);
    

    gameFrame++;
    requestAnimationFrame(animate);
};

animate();