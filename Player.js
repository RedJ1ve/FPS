import * as THREE from 'three';

class Player {
	constructor() {
		document.body.addEventListener("click", async () => {
			document.body.requestPointerLock();
		});
		document.body.addEventListener('mousemove', (event) => this.update_rotation(event), false);
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
		this.sensitivity = 0.01;
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.lookDir = new THREE.Vector3(0, 0, 0);
	}

	update_rotation(event) {
		const pointerLock = (document.pointerLockElement == document.body)? true : false;

		if (pointerLock == true) {
			const deltaX = event.movementX || 0;
			const deltaY = event.movementY || 0;

        	this.euler.y -= deltaX * this.sensitivity;
        	this.euler.x -= deltaY * this.sensitivity;
			this.euler.x = Math.min(Math.max(this.euler.x, -Math.PI / 3), Math.PI / 3);

        	this.camera.quaternion.setFromEuler(this.euler);
			this.lookDir = new THREE.Vector3(0, 0, -1);
			this.lookDir.applyQuaternion(this.camera.quaternion);
		}
	}
}

export default Player;