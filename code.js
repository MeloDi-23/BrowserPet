let Pet = {
    possibleAnimations: {
        waiting: {name: 'wait', frames: ['slime_wait.png']},
        walk_left: {name: 'walk_left', frames: ['slime_walk.png']},
        walk_right: {name: 'walk_right', frames: ['slime_walk.png']},
        sleep: {name: 'sleep', frames: ['slime_sleep.png']}
    },
    currentState: '',
    currentAnimation: null,
    position: new Array(),
    startTime: 0,
    startPosition: null,
    updateImg: function(time) {
        let passes = time - this.startTime;
        switch(this.currentState.name) {
            case 'move': 
                if(this.currentState.speed) {
                    // 有速度方向的情况
                } else if(this.currentState.func) {
                    // 有位置函数的情况
                }
                break;
            case 'wait':
                break;
        }
        
    },
    setState: function(state) {
        /**
         * state demonstrates how the pet moves, 
         * eg:
         * - wait.
         * - move (direction, speed).
         * - move (a func which demonstrates the position of pet as time passes).
         * - move (destination, speed).
         * - listening: the browser will listen to the click and demonstrate whether to make pet move.
         */
        this.startTime = performance.now();
        this.currentState = state;
        if(state.name == 'wait') {
            if(state.animationName) {
                this.currentAnimation = this.possibleAnimations[state.animationName];
            } else 
            if(Math.random() > 0.5) {
                this.currentAnimation = this.possibleAnimations.sleep;
            } else {
                this.currentAnimation = this.possibleAnimations.waiting;
            }
        } else if(state.name == 'move') {
            this.startPosition = [
                img.offSetLeft,
                img.offSetTop
            ];
            if(state.direction) {
                this.currentAnimation = chooseAnimation(state.direction);
                // TODO: 编写chooseAnimation
            }
        }
        
    }
};
let img;
let windowSize = [document.body.clientLeft, document.body.clientHeight];
let random = (lower, upper) => Math.random()*(upper - lower) + lower;
let randInt = (max) => Math.floor(Math.random()*max);
function init() {
    img = document.createElement('img');

    window.onresize = () => {
        windowSize = [document.body.clientLeft, document.body.clientHeight];
        if(img.offSetLeft < windowSize[0]*0.1 || img.offSetLeft > windowSize[0]*0.9) {
            img.style.left = random(windowSize[0]*0.1, windowSize[0]*0.9) + 'px';
        }
        if(img.offSetTop < windowSize[1]*0.1 || img.offSetTop > windowSize[1]*0.9) {
            img.style.top = random(windowSize[1]*0.1, windowSize[1]*0.9) + 'px';
        }
    };
    initImg();

    setInterval(
        randomState,
        //TODO: 编写randState，当不处于listen状态时，随机设置状态
    10000);
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
    }
}

function initImg() {
    img.style.position = 'fixed';
    img.style.height = windowSize[1] * 0.1;

    img.style.left = random(windowSize[0]*0.1, windowSize[0]*0.9) + 'px';
    img.style.top = random(windowSize[1]*0.1, windowSize[1]*0.9) + 'px';
    randomState();
}
