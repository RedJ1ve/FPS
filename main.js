import * as THREE from 'three';
import Player from './Player.js'

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const gridHelper = new THREE.GridHelper( 1000, 20 );
scene.add( gridHelper );

let player = new Player();

player.camera.position.set(0,35,0);


function animate() {
	requestAnimationFrame( animate );

	player.update();

	renderer.render( scene, player.camera );
}

animate();