;(function () {
	let Hero = function (game, x, y) {
		Phaser.Sprite.call(this, game, x, y, 'hero');
		this.anchor.set(0.5, 0.5);
		this.game.physics.enable(this);
		this.body.collideWorldBounds = true;
		this.animations.add('stop', [0]);
		this.animations.add('run', [1, 2], 8, true);
		this.animations.add('jump', [3]);
		this.animations.add('fall', [4]);
	};
	Hero.prototype = Object.create(Phaser.Sprite.prototype);
	Hero.prototype.constructor = Hero;
	Hero.prototype.move = function (direction) {
		const SPEED = 200;
		this.body.velocity.x = direction * SPEED;
		if (this.body.velocity.x < 0) {
			this.scale.x = -1;
		}
		else if (this.body.velocity.x > 0) {
			this.scale.x = 1;
		}
	};
	Hero.prototype.jump = function () {
		const JUMP_SPEED = 600;
		let canJump = this.body.touching.down;
		if (canJump) {
			this.body.velocity.y = -JUMP_SPEED;
		}
		return canJump;
	};
	Hero.prototype.bounce = function () {
		const BOUNCE_SPEED = 200;
		this.body.velocity.y = -BOUNCE_SPEED;
	};
	Hero.prototype.update = function () {
		let animationName = this._getAnimationName();
		if (this.animations.name !== animationName) {
			this.animations.play(animationName);
		}
	};
	Hero.prototype._getAnimationName = function () {
		let name = 'stop';
		if (this.body.velocity.y < 0) {
			name = 'jump';
		}
		else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
			name = 'fall';
		}
		else if (this.body.velocity.x !== 0 && this.body.touching.down) {
			name = 'run';
		}
		return name;
	};
	window.Hero = Hero;
})();