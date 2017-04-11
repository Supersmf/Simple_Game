;(function () {
let Enemy = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'enemy');

    this.anchor.set(0.5);
    this.animations.add('crawl', [0, 1, 2], 8, true);
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    this.animations.play('crawl');

    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Enemy.SPEED;
}

Enemy.SPEED = 100;

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function () {
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Enemy.SPEED;
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Enemy.SPEED;
    }
};

Enemy.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};
	window.Enemy = Enemy;
})();