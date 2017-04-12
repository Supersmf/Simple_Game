window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', MainState);
    game.state.start('play', true, false, {level: 0});
};
const volume = 1;
const LEVEL = 4;

let MainState = {};

MainState.preload = function () {
    this.game.load.json('level:0', 'data/level00.json');
    this.game.load.json('level:1', 'data/level01.json');
    this.game.load.json('level:2', 'data/level02.json');
    this.game.load.json('level:3', 'data/level03.json');
    this.game.load.image('font:numbers', 'images/numbers.png');
    this.game.load.image('background', 'images/background.svg');
    this.game.load.image('ground', 'images/ground2.png');
    this.game.load.image('ground_6', 'images/ground_6.png');
    this.game.load.image('ground_4', 'images/ground_4.png');
    this.game.load.image('ground_2', 'images/ground_2.png');
    this.game.load.image('ground_1', 'images/ground_1.png');
    this.game.load.image('invisible-wall', 'images/invisible_wall.png');
    this.game.load.image('icon:crystal', 'images/crystal.png');
    this.game.load.image('key', 'images/key.png');

    this.game.load.spritesheet('crystal', 'images/crystal_blue.png', 32, 32);
    this.game.load.spritesheet('enemy', 'images/enemy.png', 65, 45);
    this.game.load.spritesheet('hero', 'images/hero.png', 50, 50);
    this.game.load.spritesheet('door', 'images/door.png', 64, 64);
    this.game.load.spritesheet('icon:key', 'images/key_icon.png', 30, 30);
	this.game.load.spritesheet('decoration', 'images/decorate.png', 45, 50);

    this.game.load.audio('msc:jump', 'audio/jump.wav');
    this.game.load.audio('msc:crystal', 'audio/crystal.wav');
    this.game.load.audio('msc:kill', 'audio/kill.wav');
    this.game.load.audio('msc:key', 'audio/key.wav');
    this.game.load.audio('msc:door', 'audio/door.wav');
    this.game.load.audio('song', 'audio/song.mp3');
	
};

MainState.init = function (data) {
    this.game.renderer.renderSession.roundPixels = true;
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP
    });
    this.keys.up.onDown.add(function () {
        let didJump = this.hero.jump();
        if (didJump) {
            this.msc.jump.play();
        }
    }, this);
    this.crystalPickupCount = 0;
    this.hasKey = false;
    this.level = (data.level || 0) % LEVEL;
};

let swich = false;

MainState.create = function () {

    this.game.add.image(0, 0, 'background');
    this.loadLevel(this.game.cache.getJSON(`level:${this.level}`));
	
    this.createScore();
	
	this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
	
	this.msc = {
        jump: this.game.add.audio('msc:jump'),
        crystal: this.game.add.audio('msc:crystal'),
        kill: this.game.add.audio('msc:kill'),
        key: this.game.add.audio('msc:key'),
        door: this.game.add.audio('msc:door'),
    };
	this.msc.key.volume = 3 * volume;
	this.song = this.game.add.audio('song');
	this.song.volume = 0.1 * volume;
	if(!swich){
		swich = !swich;
		this.song.loopFull();
	}
};


MainState.update = function () {
    this.collisionsControl();
    this.inputControl();

    this.crystalFont.text = `x${this.crystalPickupCount}`;
    this.keyIcon.frame = this.hasKey ? 1 : 0;
};

MainState.collisionsControl = function () {
    this.game.physics.arcade.collide(this.enemys, this.platforms);
    this.game.physics.arcade.collide(this.enemys, this.enemyWalls);
    this.game.physics.arcade.collide(this.hero, this.platforms);

    this.game.physics.arcade.overlap(this.hero, this.crystals, this.hero_crystal,null, this);
    this.game.physics.arcade.overlap(this.hero, this.enemys, this.hero_enemy, null, this);
    this.game.physics.arcade.overlap(this.hero, this.key, this.hero_key, null, this);
    this.game.physics.arcade.overlap(this.hero, this.door, this.hero_door,
        function (hero, door) {
            return this.hasKey && hero.body.touching.down;
        }, this);
};

MainState.inputControl = function () {
    if (this.keys.left.isDown) { 
        this.hero.move(-1);
    }
    else if (this.keys.right.isDown) { 
        this.hero.move(1);
    }
    else {
        this.hero.move(0);
    }
};

MainState.loadLevel = function (data) {
    this._decorate = this.game.add.group();
    this.platforms = this.game.add.group();
    this.crystals = this.game.add.group();
    this.enemys = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.enemyWalls.visible = false;

    data.platforms.forEach(this.createPlatform, this);
    this.сreateСharacter({hero: data.hero, enemys: data.enemys});
    data.crystals.forEach(this._spawncrystal, this);
    this.createDoor(data.door.x, data.door.y);
    this.createKey(data.key.x, data.key.y);
	
	data.decoration.forEach(function (deco) {
        this._decorate.add(
            this.game.add.image(deco.x, deco.y, 'decoration', deco.frame));
    }, this);
	
    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
};

MainState.createPlatform = function (platform) {
    let sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;

    this.createBarrier(platform.x, platform.y, 'left');
    this.createBarrier(platform.x + sprite.width, platform.y, 'right');
};

MainState.createBarrier = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

MainState.сreateСharacter = function (data) {
    data.enemys.forEach(function (enemy) {
        let sprite = new Enemy(this.game, enemy.x, enemy.y);
        this.enemys.add(sprite);
    }, this);

    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};

MainState._spawncrystal = function (crystal) {
    let sprite = this.crystals.create(crystal.x, crystal.y, 'crystal');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

    sprite.animations.add('rotate', [0, 1, 2, 3, 4, 5, 6, 7], 6, true); 
    sprite.animations.play('rotate');
};

MainState.createDoor = function (x, y) {
    this.door = this._decorate.create(x, y, 'door');
    this.door.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.door);
    this.door.body.allowGravity = false;
};

MainState.createKey = function (x, y) {
    this.key = this._decorate.create(x, y, 'key');
    this.key.anchor.set(0.5, 0.5);
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;
    this.key.y -= 3;
    this.game.add.tween(this.key)
        .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();
};

MainState.hero_crystal = function (hero, crystal) {
    this.msc.crystal.play();
    crystal.kill();
    this.crystalPickupCount++;
};

MainState.hero_enemy = function (hero, enemy) {
    if (hero.body.velocity.y > 0) { 
        hero.bounce();
        enemy.die();
        this.msc.kill.play();
    }
    else {
        this.msc.kill.play();
        this.game.state.restart(true, false, {level: this.level});
    }
};

MainState.hero_key = function (hero, key) {
    this.msc.key.play();
    key.kill();
    this.hasKey = true;
};

MainState.hero_door = function (hero, door) {
    this.msc.door.play();
    this.game.state.restart(true, false, { level: this.level + 1 });
};

MainState.createScore = function () {
    const NUMBERS_STR = '0123456789X ';
    this.crystalFont = this.game.add.retroFont('font:numbers', 20, 26, NUMBERS_STR);

    this.keyIcon = this.game.make.image(0, 19, 'icon:key');
    this.keyIcon.anchor.set(0, 0.5);
	
    let crystalIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:crystal');
    let crystalScoreImg = this.game.make.image(
		crystalIcon.x + crystalIcon.width, crystalIcon.height / 2, this.crystalFont);
    crystalScoreImg.anchor.set(0, 0.5);

    this.score = this.game.add.group();
    this.score.add(crystalIcon);
    this.score.add(crystalScoreImg);
    this.score.add(this.keyIcon);
    this.score.position.set(10, 10);
};