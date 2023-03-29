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
    possibleAnimations: {
        wait_left: {name: 'wait_left', frames: rangeMapsToList(3, i => `./img/wait_left/${i+1}.png`)},
        wait_right: {name: 'wait_right', frames: rangeMapsToList(3, i => `./img/wait_right/${i+1}.png`)},
        // shake_head: {name: 'shake_head', frames: rangeMapsToList(2, i => `./img/shake_head/${i+1}.png`)},
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
                    // 有速度的情况
                    this.position = [
                        act.startPosition[0] + act.speedX*passes/1000,
                        act.startPosition[1] + act.speedY*passes/1000,
                    ];
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
                    this.setAction(
                        act
                    );
                }
                if(this.position[0] < windowSize[0]*0.1) {
                    this.position[0] = windowSize[0]*0.1;
                    act.speedX = -act.speedX;
                    this.setAction(
                        act
                    );
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
            case 'wait_left':
            case 'wait_right':
            case 'wait':
            case 'listen':
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
         * - listen: the browser will listen to the click and demonstrate whether to make pet move.
         */
        let act = this.currentAction;
        act.startTime = performance.now();
        act.name = action.name;
        let availableList = new Array();
        switch(action.name) {
            case 'wait':
            case 'listen':
                availableList.push('wait_right');
            case 'wait_left':
                availableList.push('wait_left');
                break;
            case 'wait_right':
                availableList.push('wait_right');
                break;
            case 'move':
                act.startPosition = [
                    img.offsetLeft,
                    img.offsetTop
                ];
                if(!isNaN(action.angle)) {
                    let degree = (arg) => arg*Math.PI/180;
                    this.setSpeed(
                        action.speed*Math.cos(degree(action.angle)),
                        action.speed*Math.sin(degree(action.angle))
                    );
                } else if(!isNaN(action.speedX)) {
                    this.setSpeed(action.speedX, action.speedY);
                } else if(action.destination) {
                    act.destination = action.destination;
                    let pos1 = this.position, pos2 = act.destination;
                    let x = pos1[0] - pos2[0], y = pos1[1] - pos2[1];
                    let distance = Math.sqrt(x*x + y*y);
                    this.setSpeed(
                        action.speed*x/distance,
                        action.speed*y/distance
                    );
                }
                return;
        }
        act.animation = this.possibleAnimations[randChoice(availableList)];
        act.startPosition = [
            img.offsetLeft,
            img.offsetTop
        ];
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
            setTimeout(t, random(10000, 20000))
        }, 10000
    );
    img.onclick = (e) => {
        // TODO: 设置为listen状态或取消状态
        if(e.button === 0) {
            if(Pet.currentAction.name == 'listen')
                Pet.setAction({name: 'move', speed: 20, angle: 80});
                // TODO: 改为随机方向
            else
                Pet.setAction({name: 'listen'});
        }
        console.log(e);
    };
    window.onclick = (e) => {
        //TODO: 需要更多调试
        if(e.button == 0 && Pet.currentAction.name == 'listen')
            Pet.setAction({name: 'move', speed: 20, destination: [e.clientX, e.clientY]});
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

function randomState() {
    let num = Math.random();
    let availableList = new Array();
    let randAngle = () => random(0, 360);
    switch(Pet.currentAction.name) {
        case 'listen':
            availableList.push('wait_left');
            availableList.push('wait_right');
            let name = Math.random() > 0.5 ? 'wait_left': 'wait_right';
            Pet.setAction(name);
        case 'wait_left':
        case 'wait_right':
            var list2 = new Array();
            for(e in Pet.possibleAnimations)
                if(/^wait_[a-zA-Z]+$/.test(e))
                    list2.push(2);
                else
                    availableList.push(e);
            
            
            if(Math.random() > 0.7) {
                Pet.setAction(randChoice(availableList));
            } else {
                Pet.setAction(randChoice(list2));
            }
            break;
        case 'walk_left':
        case 'walk_right':
            for(e in Pet.possibleAnimations)
                availableList.push(e);
            Pet.setAction(randChoice(availableList));
            break;
    }
    
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
            speed: 40
        }
    );
    requestAnimationFrame(function f(t) {
        Pet.updateImg(t);
        requestAnimationFrame(f);
    })
}