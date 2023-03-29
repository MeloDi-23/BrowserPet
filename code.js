const FRAME_TIME = 150;
let img;
let windowSize = [document.documentElement.clientWidth, document.documentElement.clientHeight];
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
        listen: false
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
    updateImg: function(time) {
        let act = this.currentAction;
        let passes = time - act.startTime;
        let frame;
        console.assert(act.type in this.possibleActions)
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

                if(this.position[0] > windowSize[0]*0.9) {
                    this.position[0] = windowSize[0]*0.9;
                    act.speedX = -act.speedX;
                    this.setAction(act);
                }
                if(this.position[0] < windowSize[0]*0.1) {
                    this.position[0] = windowSize[0]*0.1;
                    act.speedX = -act.speedX;
                    this.setAction(act);
                }
                if(this.position[1] > windowSize[1]*0.9) {
                    this.position[1] = windowSize[1]*0.9;
                    act.speedY = -act.speedY;
                    this.setAction(act);
                }
                if(this.position[1] < windowSize[1]*0.1) {
                    this.position[1] = windowSize[1]*0.1;
                    act.speedY = -act.speedY;
                    this.setAction(act);
                }
                img.style.left = this.position[0] + 'px';
                img.style.top = this.position[1] + 'px';
                frame = act.animation.frames;
                img.src = frame[Math.floor(passes/FRAME_TIME)%frame.length];
                break;
            case 'wait':
            case 'listen':
                // TODO: set random shake head animation
                frame = act.animation.frames;
                img.src = frame[Math.floor(passes/FRAME_TIME/2)%frame.length];
                break;
        }
    },
    setAction: function(action) {
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
        console.log(action.type);
        let act = new Map();
        act.startTime = performance.now();
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
                        let x = pos1[0] - pos2[0], y = pos1[1] - pos2[1];
                        let distance = Math.sqrt(x*x + y*y);
                        act.speedX = action.speed*x/distance;
                        act.speedY = action.speed*y/distance;
                        break;
                }
                if(act.speedX >= 0)
                    act.animation = this.animations.walk_right;
                else
                    act.animation = this.animations.walk_left;
                break;
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
        this.currentAction = act;
    }
};

function init() {

    window.onresize = () => {
        windowSize = [document.documentElement.clientWidth, document.documentElement.clientHeight];
        if(img.offSetLeft < windowSize[0]*0.1 || img.offSetLeft > windowSize[0]*0.9) {
            img.style.left = random(windowSize[0]*0.1, windowSize[0]*0.9) + 'px';
        }
        if(img.offSetTop < windowSize[1]*0.1 || img.offSetTop > windowSize[1]*0.9) {
            img.style.top = random(windowSize[1]*0.1, windowSize[1]*0.9) + 'px';
        }
    };
    initImg();
    document.body.appendChild(img);
    setTimeout(
        function t() {
            randomState();
            setTimeout(t, random(5000, 4000))
        }, 5000
    );
    img.onclick = (e) => {
        console.log('click', e);
        if(e.button === 0) {
            if(Pet.currentAction.type == 'listen')
                Pet.setAction({type: 'move', speed: 20, angle: 'random'});
                // random direction
            else
                Pet.setAction({type: 'listen'});
                // PROBLEM: the img.onclick & window.onclick with call at the same time.
        }
    };
    window.onclick = (e) => {
        //TODO: 需要更多调试
        if(e.button == 0 && Pet.currentAction.type == 'listen') {
            Pet.setAction({type: 'move', speed: 20, destination: [e.clientX, e.clientY]});
            console.log(e);
        }
        //TODO 如果pet为listen状态，则设置状态为定点移动
    };
}

function initImg() {
    img = document.createElement('img');

    img.style.position = 'fixed';
    img.style.height = windowSize[1] * 0.1 + 'px';
    img.style.width = img.style.height;

    img.style.left = random(windowSize[0]*0.1, windowSize[0]*0.9) + 'px';
    img.style.top = random(windowSize[1]*0.1, windowSize[1]*0.9) + 'px';
}

function randomState() {
    // PROBLEM: net::ERR_FILE_NOT_FOUND occurs, but it seems not influence the program
    switch(Pet.currentAction.type) {
        case 'listen':
            // Pet.setAction({type: 'wait'});
            break;
        case 'wait':
            let match = Pet.currentAction.animation.name.match(/^wait_([a-zA-Z]+)$/);
            if(Math.random() > 0.7) {
                Pet.setAction({type: 'move', speed: 20, angle: 'random'});
            } else {
                if(match[1] == 'left')
                    Pet.setAction({type: 'wait', animation: 'wait_right'});
                else
                    Pet.setAction({type: 'wait', animation: 'wait_right'});
            }
            break;
        case 'move':
            if(Math.random() > 0.5) {
                Pet.setAction({type: 'move', speed: 20, angle: 'random'});
            } else {
                Pet.setAction({type: 'wait'});
            }
            break;
    }
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