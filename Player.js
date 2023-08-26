import * as THREE from 'three';

class Input {
	constructor() {
		this.mouseFired = false;
		this.deltaX = 0
		this.deltaY = 0;
		this.pointerLock = false;
		this.keys = {};

		document.body.addEventListener('click', async () => {
			document.body.requestPointerLock();
		});
		document.body.addEventListener('keydown', (event) => this.keyDown(event), false);
		document.body.addEventListener('keyup', (event) => this.keyUp(event), false);
		document.body.addEventListener('mousemove', (event) => this.mouseMove(event), false);
	}

	update() {
		this.pointerLock = (document.pointerLockElement == document.body)? true : false;
		if (this.mouseFired == false) {
			this.mouseMove();
		}

		this.mouseFired = false;
	}

	keyDown(event) {
		this.keys[event.keyCode] = true;
	}

	keyUp(event) {
		this.keys[event.keyCode] = false;
	}

	key(code) {
		return this.keys[code];
	}

	mouseMove(event = 0) {
		this.mouseFired = true;
		this.deltaX = event.movementX || 0;
		this.deltaY = event.movementY || 0;
	}
}

class Player {
	constructor() {
		this.height = 20;
		this.input = new Input();
		this.clock = new THREE.Clock();
		this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
		this.sensitivity = 0.01;
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 );
		this.lookDir = new THREE.Vector3(0, 0, 0);
		this.wishDir = new THREE.Vector3(0, 0, 0);
		this.forwardSpeed = 1;
		this.sideSpeed = 1;
		this.velocity = new THREE.Vector3(0, 0, 0);
		this.grounded = true;
		this.runAcceleration = 14;
		this.moveSpeed = 5;
		this.friction = 0.94;
		this.airAcceleration = 2;
		this.airDeceleration = 2;
		this.sideStrafeSpeed = 1;
		this.sideStrafeAcceleration = 50;
		this.wishJump = false;
		this.jumpPower = 1.1;
		this.gravity = 3;
		this.airControlPower = 0.3;
		this.deltaTime = 0;
	}

	update() {
		this.input.update();
		this.update_camera();
		this.update_wishDir();

		if(this.input.keys(16)) {
			this.deltaTime = this.clock.getDelta() * 0.3;
		} else {
			this.deltaTime = this.clock.getDelta();
		}

		this.velocity.y -= this.gravity * this.deltaTime;

		if(this.camera.position.y <= this.height) {
			this.camera.position.y = this.height;
			this.grounded = true;
		} else {
			this.grounded = false;
		}

		if(this.grounded) {
			this.groundMove();
		} else {
			this.airMove();
		}

		console.log(this.velocity.length());
		this.camera.position.add(this.velocity);
	}

	update_camera() {
		if (this.input.pointerLock == true) {
			this.euler.y -= this.input.deltaX * this.sensitivity;
        	this.euler.x -= this.input.deltaY * this.sensitivity;
			this.euler.x = Math.min(Math.max(this.euler.x, -Math.PI / 3), Math.PI / 3);

        	this.camera.quaternion.setFromEuler(this.euler);
			this.lookDir = new THREE.Vector3(0, 0, -1);
			this.lookDir.applyQuaternion(this.camera.quaternion);
		}
	}

	update_wishDir() {
		this.wishDir.set(0, 0, 0);

		this.wishDir.z = ((this.input.key(87) == true)? -this.forwardSpeed : 0) + ((this.input.key(83) == true)? this.forwardSpeed : 0);
		this.wishDir.x = ((this.input.key(65) == true)? -this.sideSpeed : 0) + ((this.input.key(68) == true)? this.sideSpeed : 0);

		this.wishDir.applyQuaternion(this.camera.quaternion);

		this.wishDir.y = 0;
	}

	accelerate(wishSpeed, accel) {
		let currentSpeed = this.velocity.dot(this.wishDir);
		let addSpeed = wishSpeed - currentSpeed;

		if (addSpeed <=0) {
			return;
		}

		let accelSpeed = accel * this.deltaTime * wishSpeed;

		if (accelSpeed > addSpeed) {
			accelSpeed = addSpeed;
		}

		const wishDir2 = new THREE.Vector3();
		wishDir2.copy(this.wishDir);
		wishDir2.y = 0;
		wishDir2.multiplyScalar(accelSpeed);
		this.velocity.add(wishDir2);
	}

	groundMove() {
		this.queueJump();

		if(!this.wishJump) {
			this.applyFriction();
		}

		this.update_wishDir();
		this.wishDir.normalize();
		let wishSpeed = this.wishDir.length() * this.moveSpeed;

		this.accelerate(wishSpeed, this.runAcceleration);

		this.velocity.y = 0;

		if (this.wishJump) {
			this.velocity.y = this.jumpPower;
			this.wishJump = false;
		}
	}

	airMove() {
		this.update_wishDir();
		let wishSpeed = this.wishDir.length() * this.moveSpeed;
		this.wishDir.normalize();

		let accel;
		 
		if (this.velocity.dot(this.wishDir) < 0) {
			accel = this.airDeceleration;
		} else {
			accel = this.airAcceleration;
		}

		let wishSpeed2 = wishSpeed;
		if ((this.input.key(65) || this.input.key(68)) && (!this.input.key(87) || !this.input.key(83))) {
			if (wishSpeed > this.sideStrafeSpeed) {
				wishSpeed = this.sideStrafeSpeed;
			}
			accel = this.sideStrafeAcceleration
		}

		this.accelerate(wishSpeed, accel);
		this.airControl(wishSpeed2);
	}

	airControl(wishSpeed) {
		if (!this.input.key(87) || !this.input.key(83) || wishSpeed < 0.01) {
			return
		}

		let ySpeed = this.velocity.y;
		this.velocity.y = 0;
		let speed = this.velocity.length();
		this.velocity.normalize();

		let dot = this.velocity.dot(this.wishDir);
		let k = this.airControlPower * dot * dot * 32 * this.deltaTime;

		if (dot > 0) {
			this.velocity.x = this.velocity.x * speed * this.wishDir.x * k;
			this.velocity.y = this.velocity.y * speed * this.wishDir.y * k;
			this.velocity.z = this.velocity.z * speed * this.wishDir.z * k;

			this.velocity.normalize();
		}

		this.velocity.x *= speed;
		this.velocity.y = ySpeed;
		this.velocity.z *= speed;
	}

	queueJump() {
		if (this.input.key(32) /*  && !this.wishJump  */) {
			this.wishJump = true;
		}
	}



	applyFriction() {
		if (this.grounded) {
			this.velocity.x *= this.friction;
			this.velocity.z *= this.friction;
		}
	}
}

export default Player;