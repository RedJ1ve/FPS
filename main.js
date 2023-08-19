import * as THREE from 'three';
import Player from './Player.js'

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

const gridHelper = new THREE.GridHelper( 1000, 20 );
scene.add( gridHelper );

let player = new Player();

player.camera.position.set(0,2,0);

const origin = new THREE.Vector3(0,0,0);
let arrowHelper = new THREE.ArrowHelper(player.lookDir2, origin, 0xffff00);
scene.add(arrowHelper);

function animate() {
	requestAnimationFrame( animate );

	arrowHelper.setDirection(player.lookDir)

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.render( scene, player.camera );
}

animate();