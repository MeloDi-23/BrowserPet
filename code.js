const FRAME_TIME = 150;
const SCALE = 0.05;
let img;
let ID;
let windowSize = [document.documentElement.clientWidth, document.documentElement.clientHeight];
imgSize = windowSize[1] * SCALE;
let rangeHor = [0, windowSize[0] - imgSize], rangeVer = [0, windowSize[1] - imgSize];

let random = (lower, upper) => Math.random()*(upper - lower) + lower;
let randInt = (max) => Math.floor(Math.random()*max);
let randChoice = (ls) => ls[randInt(ls.length)];
let rangeMapsToList = function(end, func) {
    let ret = new Array();
    for(let i = 0; i < end; i++) {
        ret.push(func(i));
    }
    return ret;
}

let Pet = {
    animations: {
        wait_left: {name: 'wait_left', frames: rangeMapsToList(3, i => `./img/wait_left/${i+1}.png`)},
        wait_right: {name: 'wait_right', frames: rangeMapsToList(3, i => `./img/wait_right/${i+1}.png`)},
        shake_head: {name: 'shake_head', frames: rangeMapsToList(2, i => `./img/shake_head/${i+1}.png`)},
        walk_left: {name: 'walk_left', frames: rangeMapsToList(6, i => `./img/walk_left/${i+1}.png`)},
        walk_right: {name: 'walk_right', frames: rangeMapsToList(6, i => `./img/walk_right/${i+1}.png`)},
        // tested, all paths are valid
    },
    possibleActions: {// key is the action name, value is whether it moves
        move: true,
        wait: false,
        listen: false,
        jump: false,
    },
    position: new Array(),
    currentAction: {
        startTime: 0,
        startPosition: null,
        animation: null,
    },
    setSpeed: function(speedX, speedY) {
        this.currentAction.speedX = speedX;
        this.currentAction.speedY = speedY;
        if(speedX >= 0)
            this.currentAction.animation = this.animations.walk_right;
        else
            this.currentAction.animation = this.animations.walk_left;
    },
};

Pet.updateImg = function(time) {
    // A SMALL PROBLEM: sometimes the requireAnimationFrame and setAction contradicts, 
    // so the startTime may be smaller than time.
    // I add a judgement to see whether the `passes` is positive.
    // It is probably caused because the requireAnimationFrame call this function very freguently.
    let act = this.currentAction;
    let passes = time - act.startTime;
    if(passes < 0)
        passes = 0;
    function jumpHeight(process, maxHeight) {
        if(process <= 1 && process >= 0)
            return maxHeight*(1 - process)*process*4;
        else
            return 0;
    }
    console.assert(act.type in this.possibleActions);
    switch(act.type) {
        case 'move':
            if(act.speedX + act.speedY) {
                // 有速度的情况
                this.position = [
                    act.startPosition[0] + act.speedX*passes/1000,
                    act.startPosition[1] + act.speedY*passes/1000,
                ];
                // TODO: if there is a destination, set the state to listen
            } else if(act.func) {
                // 有位置函数的情况
                let ret = act.func(passes);
                this.position = [
                    act.startPosition[0] + ret[0],
                    act.startPosition[1] + ret[1],
                ];
                act.animation = chooseAnimation(ret[2], ret[3]);
            }
            if(act.destination) {
                if(
                    (act.destination[0] - this.position[0])*act.speedX <= 0 ||
                    (act.destination[1] - this.position[1])*act.speedY <= 0
                ) {// 到达终点
                    this.position = act.destination;
                    img.style.left = this.position[0] + 'px';
                    img.style.top = this.position[1] + 'px';
                    this.setAction({type: 'wait'});
                    startRand(4000); // after reaching the dest, wait for 5 secs and then move freely.
                    return;
                }
            }

            if(this.position[0] > rangeHor[1]) {
                this.position[0] = rangeHor[1];
                act.speedX = -act.speedX;
                this.setAction(act);
            }
            if(this.position[0] < rangeHor[0]) {
                this.position[0] = rangeHor[0];
                act.speedX = -act.speedX;
                this.setAction(act);
            }
            if(this.position[1] > rangeVer[1]) {
                this.position[1] = rangeVer[1];
                act.speedY = -act.speedY;
                this.setAction(act);
            }
            if(this.position[1] < rangeVer[0]) {
                this.position[1] = rangeVer[0];
                act.speedY = -act.speedY;
                this.setAction(act);
            }

            {
                let frame = act.animation.frames;
            
                let count = Math.floor(passes/FRAME_TIME)%frame.length;
                img.src = frame[count];

                img.style.left = this.position[0] + 'px';
                img.style.top = this.position[1] - jumpHeight(count/frame.length, imgSize/4) + 'px';
                break;
            }
        case 'wait':
        case 'listen': {
            // TODO: set random shake head animation
            let frame = act.animation.frames;
            img.src = frame[Math.floor(passes/FRAME_TIME/2)%frame.length];

            break;
        }
        case 'jump': {
            let frame = act.animation.frames;
            let count = Math.floor(passes/FRAME_TIME)%frame.length;
            img.src = frame[count];
            img.style.top = this.position[1] - jumpHeight(count/frame.length, imgSize/2) + 'px';
            break;
        }
    }
};

Pet.setAction = function(action) {
    /**
     * action demonstrates the pet
     * action = {
     *  type: wait|move|listen
     *  animation: animation name, not neccesary
     *  other args:
     *      eg: angle, speed, speedX, speedY, func, destination
     * }
     * all possibilities are below:
     * - wait.
     * - move (angle: 0-360|'random', speed).
     * - move (speedX, speedY).
     * - move (a func which demonstrates the position of pet and its velocity as time passes).
     * - move (destination: [number, number], speed).
     * - listen: the browser will listen to the click and demonstrate whether to make pet move.
     */
    // TODO: add a return value that demonstrate the next call time.
    // in listen mode, clear the time out
    // when cancel the listen mode, revive the set time out
    console.log(action.type);
    let act = new Map();
    act.type = action.type;
    switch(action.type) {
        case 'wait':
        case 'listen':
            let availableList = [
                'wait_right',
                'wait_left'
            ]
            act.animation = this.animations[randChoice(availableList)];
            break;
        case 'move':
            switch(true) {
                case !isNaN(action.angle): {
                    let degree = (arg) => arg*Math.PI/180;
                    act.speedX = action.speed*Math.cos(degree(action.angle));
                    act.speedY = action.speed*Math.sin(degree(action.angle));
                    break;
                }
                case action.angle == 'random': {
                    let angle = random(0, 2*Math.PI);
                    act.speedX = action.speed*Math.cos(angle);
                    act.speedY = action.speed*Math.sin(angle);
                    break;
                }
                case !isNaN(action.speedX + action.speedY):
                    act.speedX = action.speedX;
                    act.speedY = action.speedY
                    break;
                case Boolean(action.destination):
                    act.destination = action.destination;
                    let pos1 = this.position, pos2 = act.destination;
                    let x = pos2[0] - pos1[0], y = pos2[1] - pos1[1];
                    let distance = Math.sqrt(x*x + y*y);
                    act.speedX = action.speed*x/distance;
                    act.speedY = action.speed*y/distance;
                    clearTimeout(ID);
                    break;
            }
            if(act.speedX >= 0)
                act.animation = this.animations.walk_right;
            else
                act.animation = this.animations.walk_left;
            break;
        case 'jump': {
            let availableList = [
                'walk_right',
                'walk_left'
            ]
            act.animation = this.animations[randChoice(availableList)];
            break;
        }
        default:
            throw 'no such type: '+action.type;
    }
    act.startPosition = [
        img.offsetLeft,
        img.offsetTop
    ];
    if(action.animation in this.animations) {
        // enforce the animation, regardless of all other conditions
        act.animation = this.animations[action.animation];
    }
    act.startTime = performance.now();
    this.currentAction = act;
};

Pet.randAction = function() {
    /**
     * when in state of listen/reaching destination, cannot change action
     * when moving, 50% continue, 50% stop, where 10% jump, 40% wait
     * when wait, 70% move, 30% jump
     * when jump, 100% wait for 3 sec
     * jump always takes 3 secs time
     */
    switch(this.currentAction.type) {
        case 'listen':
            // clearTimeout(ID);
            // ID = null;
            return -1;
            
        case 'wait':
            let match = this.currentAction.animation.name.match(/^wait_([a-zA-Z]+)$/);
            let rd = Math.random();
            switch(true) {
                case rd > 0.3:
                    this.setAction({type: 'move', speed: 20, angle: 'random'});
                    break;
                case rd > 0.0:
                    this.setAction({type: 'jump'});
                    return 3000;
                    // jump for 3 secs
                default:
                    if(match[1] == 'left')
                        this.setAction({type: 'wait', animation: 'wait_right'});
                    else
                        this.setAction({type: 'wait', animation: 'wait_right'});
            }
            break;
        case 'move': {
            if(this.currentAction.destination)
                // 有目的地，禁用随机行走
                return;
            let rd = Math.random();
            switch(true) {
                case rd > 0.5:
                    this.setAction({type: 'move', speed: 20, angle: 'random'});
                    break;
                case rd > 0.4:
                    this.setAction({type: 'jump'});
                    return 3000;
                default:
                    this.setAction({type: 'wait'});
                    break;
            }
        }
        case 'jump': {
            this.setAction({type: 'wait'});
            return 3000;
        }
    }
    return random(5000, 10000);
    // wait for 5~10 secs
}

function startRand(timeOut) {
    ID = setTimeout(
        function t() {
            let ret = Pet.randAction();
            if(ret != -1)
                ID = setTimeout(t, ret)
        }, timeOut
    );
}

function init() {
    window.onresize = () => {
        windowSize = [document.documentElement.clientWidth, document.documentElement.clientHeight];
        imgSize = windowSize[1] * SCALE;
        img.style.width = img.style.height;
        rangeHor = [0, windowSize[0] - windowSize[1] * SCALE];
        rangeVer = [0, windowSize[1] - windowSize[1] * SCALE];
        if(img.offSetLeft < rangeHor[0] || img.offSetLeft > rangeHor[1]) {
            img.style.left = random(rangeHor[0], rangeHor[1]) + 'px';
        }
        if(img.offSetTop < rangeVer[0] || img.offSetTop > rangeVer[1]) {
            img.style.top = random(rangeVer[0], rangeVer[1]) + 'px';
        }
    };
    initImg();
    document.body.appendChild(img);
    
    img.addEventListener('click', (e) => {
        // console.log(e);
        if(e.button === 0 && e.ctrlKey) {
            if(Pet.currentAction.type == 'listen')
                Pet.setAction({type: 'move', speed: 20, angle: 'random'});
                // random direction
            else
                Pet.setAction({type: 'listen'});
                // PROBLEM: the img.onclick & window.onclick with call at the same time.
        }
    }, {passionate: false});
    window.onclick = (e) => {
        //TODO: 需要更多调试
        if(e.button == 0 && !e.ctrlKey && Pet.currentAction.type == 'listen') {
            Pet.setAction({type: 'move', speed: 20, destination: [e.clientX, e.clientY]});
            console.log(e);
        }
        //TODO 如果pet为listen状态，则设置状态为定点移动
    };

    startRand();
}

function initImg() {
    img = document.createElement('img');

    img.style.position = 'fixed';

    img.style.height = imgSize + 'px';
    img.style.width = img.style.height;

    img.style.left = random(rangeHor[0], rangeHor[1]) + 'px';
    img.style.top = random(rangeVer[0], rangeVer[1]) + 'px';
}

window.onload = function() {
    for(let e in Pet.animations) {
        let div = document.createElement('div');
        div.innerHTML = e.replace('_', ' ');
        document.body.appendChild(div);
        
        for(let s of Pet.animations[e].frames) {
            let img = document.createElement('img');
            img.src = s;
            document.body.appendChild(img);
        }
    }
    init();
    Pet.setAction(
        {
            type: 'move',
            angle: 0,
            speed: 40
        }
    );
    requestAnimationFrame(function f(t) {
        Pet.updateImg(t);
        requestAnimationFrame(f);
    })
}