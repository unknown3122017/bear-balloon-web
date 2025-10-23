
const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 600,
    physics: { default: 'arcade' },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let bear, balloon, cursors, arrows, enemies, scoreText, levelText, timeText, livesGroup;
let score = 0, level = 1, lives = 3, startTime;
let gameStarted = false, gameOver = false;

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('bear', 'assets/bear.png');
    this.load.image('balloon', 'assets/balloon.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('arrow', 'assets/arrow.png');
    this.load.image('heart', 'assets/heart.png');
    this.load.audio('pop', 'assets/pop.wav');
    this.load.audio('hit', 'assets/hit.wav');
}

function create() {
    this.add.image(450, 300, 'background').setDisplaySize(900, 600);

    cursors = this.input.keyboard.createCursorKeys();

    showStartScreen.call(this);

    this.input.keyboard.on('keydown-ENTER', () => {
        if (!gameStarted) {
            startGame.call(this);
        } else if (gameOver) {
            this.scene.restart();
            score = 0;
            level = 1;
            lives = 3;
            gameOver = false;
        }
    });

    this.input.keyboard.on('keydown-ESC', () => {
        if (gameOver) {
            this.scene.stop();
        }
    });
}

function showStartScreen() {
    const title = this.add.text(450, 180, '🐻 Bear Balloon Web 🎈', {
        fontSize: '48px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    const instructions = this.add.text(450, 260, 'Use ← → to move | SPACE to shoot', {
        fontSize: '24px', fill: '#ffffff'
    }).setOrigin(0.5);

    const startText = this.add.text(450, 320, 'Press ENTER to start', {
        fontSize: '24px', fill: '#ffff00', fontStyle: 'bold'
    }).setOrigin(0.5);
}

function startGame() {
    gameStarted = true;
    startTime = this.time.now;

    bear = this.physics.add.sprite(450, 500, 'bear').setScale(0.4).setCollideWorldBounds(true);
    balloon = this.add.image(bear.x, bear.y - 100, 'balloon').setScale(0.3);

    arrows = this.physics.add.group();
    enemies = this.physics.add.group();

    scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#ffffff' });
    levelText = this.add.text(10, 40, 'Level: 1', { fontSize: '20px', fill: '#ffffff' });
    timeText = this.add.text(10, 70, 'Time: 0s', { fontSize: '20px', fill: '#ffffff' });

    livesGroup = this.add.group();
    for (let i = 0; i < lives; i++) {
        livesGroup.add(this.add.image(850 - i * 50, 30, 'heart').setScale(0.2));
    }

    this.time.addEvent({ delay: 1200, callback: spawnEnemy, callbackScope: this, loop: true });

    this.physics.add.overlap(arrows, enemies, hitEnemy, null, this);
    this.physics.add.overlap(enemies, bear, loseLife, null, this);
}

function update(time) {
    if (!gameStarted || gameOver) return;

    if (cursors.left.isDown) {
        bear.setVelocityX(-300);
    } else if (cursors.right.isDown) {
        bear.setVelocityX(300);
    } else {
        bear.setVelocityX(0);
    }

    balloon.x = bear.x;

    if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
        let arrow = arrows.create(bear.x, bear.y - 50, 'arrow').setScale(0.3);
        arrow.setVelocityY(-500);
    }

    timeText.setText(`Time: ${Math.floor((time - startTime) / 1000)}s`);

    if (score >= level * 100) {
        level++;
        levelText.setText(`Level: ${level}`);
    }
}

function spawnEnemy() {
    if (!gameStarted || gameOver) return;

    let y = Phaser.Math.Between(100, 400);
    let side = Phaser.Math.Between(0, 1);
    let x = side === 0 ? -50 : 950;
    let enemy = enemies.create(x, y, 'enemy').setScale(0.4);
    enemy.setVelocityX(side === 0 ? 150 : -150);
}

function hitEnemy(arrow, enemy) {
    arrow.destroy();
    enemy.destroy();
    score += 15;
    scoreText.setText(`Score: ${score}`);
    this.sound.play('pop');
}

function loseLife(bear, enemy) {
    enemy.destroy();
    lives--;
    livesGroup.getChildren()[lives].destroy();
    this.sound.play('hit');
    if (lives <= 0) {
        showGameOver.call(this);
    }
}

function showGameOver() {
    gameOver = true;
    this.add.rectangle(450, 300, 900, 600, 0x000000, 0.8);
    this.add.text(450, 220, 'GAME OVER 💀', {
        fontSize: '48px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(450, 280, `Your Score: ${score}`, {
        fontSize: '24px', fill: '#dddddd'
    }).setOrigin(0.5);
    this.add.text(450, 320, `Time: ${Math.floor((this.time.now - startTime) / 1000)}s`, {
        fontSize: '24px', fill: '#dddddd'
    }).setOrigin(0.5);
    this.add.text(450, 380, 'Press ENTER to restart or ESC to quit', {
        fontSize: '20px', fill: '#ffff00', fontStyle: 'bold'
    }).setOrigin(0.5);
}
