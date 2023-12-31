const state = {
    screen: "start", // "start", "pre-shot", "camera", "finish"
    par: 4,
    hits: 0,
    isFirstHit: true,
}

function reset() {
    window.location.reload()
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false, // Set to true for debugging
        }
    },
    scene: {
        preload,
        create,
        update,
    }
}

var game = new Phaser.Game(config)
var green
var golfBall
var pot

function preload() {
    this.load.image('golfBall', './golf-ball.svg');
}

function create() {
    // Create the golf green sprite
    green = this.add.graphics();
    green.fillStyle(0x009170); // Green color
    green.fillRect(0, 0, config.width, config.height);

    // Create golf ball sprite
    golfBall = this.physics.add.sprite(config.width / 2, config.height - (config.height * 0.3), 'golfBall');
    golfBall.setScale(0.06); // Adjust the scale as needed
    golfBall.setCollideWorldBounds(true);
    golfBall.body.bounce.set(1);
    golfBall.body.useDamping=true;
    golfBall.body.setDrag(0.2);

    // Create a black circle (pot)
    pot = this.add.circle(config.width / 2, config.height * 0.3, 20, 0x000000);
    this.physics.add.existing(pot); // Enable physics for the circle
    pot.body.immovable = true

    // Enable physics for the edges of the box
    this.physics.world.setBounds(0, 0, config.width, config.height);

    // add colider
    this.physics.add.collider(golfBall, pot, (golfBall, pot) => {
        golfBall.destroy()
        pot.destroy()
        changeScreen('finish')
    })
}

function update() {
    // this.physics.world.collide(golfBall, green, bounceBall, null, this);
}

function render() {
    document.getElementById('par').innerText = state.par
    document.getElementById('hits').innerText = state.hits

    const screens = document.querySelectorAll('.screen')
    screens.forEach(screen => {
        console.log(screen.dataset.screen)
        if (screen.dataset.screen === state.screen) {
            screen.style.display = 'flex'
        } else {
            screen.style.display = 'none'
        }
    })

    const finishText = document.getElementById('finish-text')
    const finishScore = document.getElementById('finish-score')

    if (state.hits === 1) {
        finishText.innerText = 'You got a\nHOLE IN ONE!'
        finishScore.innerText = ''
    } else {
        const score = state.hits - state.par
        finishScore.innerText = `${score}`
        switch (score) {
            case -4:
                finishText.innerText = 'You got a\nCONDOR!'
                break;

            case -3:
                finishText.innerText = 'You got an\nALBATROSS!'
                break;
            
            case -2:
                finishText.innerText = 'You got an\nEAGLE!'
                break;

            case -1:
                finishText.innerText = 'You got a\nBIRDIE!'
                break;

            case 0:
                finishText.innerText = 'You got PAR!'
                break;

            case 1:
                finishText.innerText = 'You got a\nBOGEY'
                finishScore.innerText = `+${score}`
                break;
            
            case 2:
                finishText.innerText = 'You got a\nDOUBLE BOGEY'
                finishScore.innerText = `+${score}`
                break;

            case 3:
                finishText.innerText = 'You got a\nTRIPLE BOGEY'
                finishScore.innerText = `+${score}`
                break;

            default:
                finishText.innerText = 'Err... you suck at this, sorry'
                finishScore.innerText = `+${score}`
                break;
        }
    }
}

function changeScreen(screen) {
    state.screen = screen
    render()
}

function addHit() {
    state.hits = state.hits + 1
    render()
}

(() => {
    document.getElementById('start').addEventListener('click', () => {
        changeScreen("pre-shot")
    })

    document.getElementById('take-shot').addEventListener('click', () => {
        changeScreen("camera")
    })

    document.getElementById('start-again').addEventListener('click', () => {
        reset()
    })

    render()
})()