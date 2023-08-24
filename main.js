import * as THREE from 'three';
import Player from './Player.js'
import GJK from './Collision.js';

const scene = new THREE.Scene();
// const collision = new Collision();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const gridHelper = new THREE.GridHelper(30000, 1000);
scene.add( gridHelper );

let player = new Player();

player.camera.position.set(0,35,0);

const geometry1 = new THREE.BoxGeometry( 20, 35, 20 );
const material1 = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const mesh1 = new THREE.Mesh( geometry1, material1 );
scene.add(mesh1);

const geometry2 = new THREE.BoxGeometry(40, 40, 40);
const material2 = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const mesh2 = new THREE.Mesh( geometry2, material2 );
mesh2.position.set(0, 20, 300);
scene.add(mesh2);

function animate() {
	requestAnimationFrame( animate );

	player.update();
	mesh1.position.set(player.camera.position.x, player.camera.position.y - 40, player.camera.position.z)
	console.log(GJK(mesh1, mesh2));
	// GJK(mesh1, mesh2)
	renderer.render( scene, player.camera );
}

animate();