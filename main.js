import * as THREE from 'three';
import Player from './Player.js'
import EPA from './EPA.js';
import GJK from './GJK.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const physicsSteps = 1;

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();

const loader = new RGBELoader();
const texture = loader.load(
	'./skybox.hdr',
	() => {
		var envMap = pmremGenerator.fromEquirectangular( texture ).texture;
		
		scene.background = envMap;
		scene.environment = envMap;

		texture.dispose();
        pmremGenerator.dispose();
});

const gridHelper = new THREE.GridHelper(40000, 1400);
scene.add( gridHelper );

let player = new Player();

player.camera.position.set(0, 20, 0);

const geometry1 = new THREE.BoxGeometry( 15, 25, 15 );
const material1 = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const mesh1 = new THREE.Mesh( geometry1, material1 );
player.camera.add(mesh1);
const box1 = new THREE.Box3();
scene.add(player.camera);

const geometry2 = new THREE.BoxGeometry(40, 40, 40);
const material2 = new THREE.MeshStandardMaterial( { roughness: 0, metalness: 1, color: 0x008000 } );
const mesh2 = new THREE.Mesh( geometry2, material2 );
const box2 = new THREE.Box3();
mesh2.position.set(0, 20, -300);
scene.add(mesh2);



function animate() {
	requestAnimationFrame( animate );

	player.update();

	if (box1.intersectsBox(box2)) {
		let collision = GJK(mesh2, mesh1);
		
		if (collision.collision == true) {
			console.log(true);
			const rebound = 1;

			let points = EPA(collision.simplex, mesh2, mesh1);
			const offset = points.normal.clone().multiplyScalar(points.penetrationDepth);
			
			player.camera.position.add(offset);

			player.velocity.reflect(points.normal.clone());
			player.velocity.multiplyScalar(rebound);

			
			//player.velocity.add(offset.multiplyScalar(rebound));
			box1.setFromObject(mesh1);
		} else {
		//console.log(false);
		mesh2.material.color.setHex( 0x008000 );
		}
	}

	box1.setFromObject(mesh1);
	box2.setFromObject(mesh2);

	renderer.render( scene, player.camera );
}

animate();
