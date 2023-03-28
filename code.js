let img;
let windowSize = [document.documentElement.clientWidth, document.documentElement.clientHeight];
let random = (lower, upper) => Math.random()*(upper - lower) + lower;
let randInt = (max) => Math.floor(Math.random()*max);
let rangeMapsToList = function(end, func) {
    let ret = new Array();
    for(let i = 0; i < end; i++) {
        ret.push(func(i));
    }
    return ret;
}
const FRAME_TIME = 80;

let Pet = {
    possibleAnimations: {
        wait_left: {name: 'wait_left', frames: rangeMapsToList(3, i => `./img/wait_left/${i+1}.png`)},
        wait_right: {name: 'wait_right', frames: rangeMapsToList(3, i => `./img/wait_right/${i+1}.png`)},
        shake_head: {name: 'shake_head', frames: rangeMapsToList(2, i => `./img/shake_head/${i+1}.png`)},
        walk_left: {name: 'walk_left', frames: rangeMapsToList(6, i => `./img/walk_left/${i+1}.png`)},
        walk_right: {name: 'walk_right', frames: rangeMapsToList(6, i => `./img/walk_right/${i+1}.png`)},
        // tested, all paths are valid
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
            this.currentAction.animation = this.possibleAnimations.walk_right;
        else
            this.currentAction.animation = this.possibleAnimations.walk_left;
    },
    updateImg: function(time) {
        let act = this.currentAction;
        let passes = time - act.startTime;
        let frame;
        switch(act.name) {
            case 'move':
                if(act.speedX + act.speedY) {
                    this.position = [
                        act.startPosition[0] + act.speedX*passes/1000,
                        act.startPosition[1] + act.speedY*passes/1000,
                    ];
                    // 有速度的情况
                } else if(act.func) {
                    let ret = act.func(passes);
                    this.position = [
                        act.startPosition[0] + ret[0],
                        act.startPosition[1] + ret[1],
                    ];
                    act.animation = chooseAnimation(ret[2], ret[3]);
                    // 有位置函数的情况
                    // 还需要改变animation
                }

                if(this.position[0] > windowSize[0]*0.9 || this.position[0] < windowSize[0]*0.1)
                //TODO: 调整其位置使之不会越界
                    this.setSpeed(-act.speedX, act.speedY);
                if(this.position[1] > windowSize[1]*0.9 || this.position[1] < windowSize[1]*0.1)
                    this.setSpeed(act.speedX, -act.speedY);
                img.style.left = this.position[0] + 'px';
                img.style.top = this.position[1] + 'px';
                frame = act.animation.frames;
                img.src = frame[Math.floor(passes/FRAME_TIME)%frame.length];
                break;
            case 'wait':
                frame = act.animation.frames;
                img.src = frame[Math.floor(passes/FRAME_TIME)%frame.length];
                break;
        }
    },
    setAction: function(action) {
        /**
         * action demonstrates how the pet moves, 
         * eg:
         * - wait.
         * - move (angle, speed).
         * - move (speedX, speedY).
         * - move (a func which demonstrates the position of pet and its velocity as time passes).
         * - move (destination, speed).
         * - listening: the browser will listen to the click and demonstrate whether to make pet move.
         */
        
        let act = this.currentAction;
        act.startTime = performance.now();
        act.name = action.name;
        switch(action.name) {
            case 'wait':
                if(action.animationName) {
                    this.currentAnimation = this.possibleAnimations[action.animationName];
                } else 
                if(Math.random() > 0.5) {
                    this.currentAnimation = this.possibleAnimations.sleep;
                } else {
                    this.currentAnimation = this.possibleAnimations.waiting;
                }
                break;
            case 'move':
                act.startPosition = [
                    img.offsetLeft,
                    img.offsetTop
                ];
                if(!isNaN(action.angle)) {
                    this.setSpeed(
                        action.speed*Math.cos(action.angle),
                        action.speed*Math.sin(action.angle)
                    );
                    // act.speedX = action.speed*Math.cos(action.angle);
                    // act.speedY = action.speed*Math.sin(action.angle);
                    // act.animation = chooseAnimation(act.speedX, act.speedY);
                } else if(!isNaN(action.speedX)) {
                    this.setSpeed(action.speedX, action.speedY);
                    // act.speedX = action.speedX;
                    // act.speedY = action.speedY;
                    // act.animation = chooseAnimation(act.speedX, act.speedY);
                } else if(action.destination) {
                    act.destination = action.destination;
                    let pos1 = this.position, pos2 = act.destination;
                    let x = pos1[0] - pos2[0], y = pos1[1] - pos2[1];
                    let distance = Math.sqrt(x*x + y*y);
                    // act.speedX = action.speed*x/distance;
                    // act.speedY = action.speed*y/distance;
                    this.setSpeed(
                        action.speed*x/distance,
                        action.speed*y/distance
                    );
                }
                break;
        }
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

    // setInterval(
    //     randomState,
    //     //TODO: 编写randState，当不处于listen状态时，随机设置状态
    // 10000);
    img.onclick = (e) => {
        // TODO: 设置为listen状态或取消状态
        switch(e.button) {
            case 1:
                break;
            case 2:
                break;
        }
    };
    window.onclick = (e) => {
        //TODO 如果pet为listen状态，则设置状态为移动
    };
}

function initImg() {
    img = document.createElement('img');

    img.style.position = 'fixed';
    img.style.height = windowSize[1] * 0.1 + 'px';
    img.style.width = img.style.height;

    img.style.left = random(windowSize[0]*0.1, windowSize[0]*0.9) + 'px';
    img.style.top = random(windowSize[1]*0.1, windowSize[1]*0.9) + 'px';
    // randomState();
}


window.onload = function() {
    for(let e in Pet.possibleAnimations) {
        let div = document.createElement('div');
        div.innerHTML = e;
        document.body.appendChild(div);
        
        for(let s of Pet.possibleAnimations[e].frames) {
            let img = document.createElement('img');
            img.src = s;
            document.body.appendChild(img);
        }
    }
    init();
    Pet.setAction(
        {
            name: 'move',
            angle: 0,
            speed: 20
        }
    );
    requestAnimationFrame(function f(t) {
        Pet.updateImg(t);
        requestAnimationFrame(f);
    })
}