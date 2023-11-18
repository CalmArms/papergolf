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

const game = new Phaser.Game(config)

var green
var golfBall;
var pot;

function preload() {
    console.log('hello')
    // Load golf ball sprite
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
        // you've potted!
        // change screen to congrats
        
    }) 


    // Set up collision event for the edges of the box
    // this.physics.world.on('collide', function (body, bodyB, shapeA, shapeB, contact) {
    //     console.log(body, bodyB)
        
    //     if (body === golfBall.body) {
    //         // Bounce the golf ball off the edges
    //         golfBall.setVelocity(-golfBall.body.velocity.x, -golfBall.body.velocity.y);
    //     }
    // });

    // // Enable collision between the golf ball and the world bounds
    // this.physics.add.collider(golfBall, this.physics.world.bounds);
}

function update() {
    this.physics.world.collide(golfBall, green, bounceBall, null, this);
}

function moveGolfBall(direction, velocity) {
    // Set the velocity of the golf ball
    golfBall.setVelocity(direction.x * velocity, direction.y * velocity);
}

function bounceBall() {
    console.log('hello?')
    // Bounce the ball off the edges of the rectangle
    golfBall.setVelocityX(golfBall.body.velocity.x * -1);
    golfBall.setVelocityY(golfBall.body.velocity.y * -1);
}

(() => {
    const state = {
        screen: "start", // "start", "pre-shot", "camera"
        par: 4,
        hits: 0,
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
    }

    function changeScreen(screen) {
        state.screen = screen
        render()
    }

    

    document.getElementById('start').addEventListener('click', () => {
        changeScreen("pre-shot")
    })

    document.getElementById('take-shot').addEventListener('click', () => {
        changeScreen("camera")
    })

    render()
})()