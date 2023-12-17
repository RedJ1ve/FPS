import * as THREE from 'three';
import Player from './Player.js'
import EPA from './EPA.js';
import GJK from './GJK.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();

const loader = new RGBELoader().setPath('assets/');
const texture = loader.load(
	'skybox.hdr',
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

const geometry2 = new THREE.BoxGeometry(4000, 200, 1000);
const material2 = new THREE.MeshStandardMaterial( { roughness: 0, metalness: 1, color: 0x008000 } );
const mesh2 = new THREE.Mesh( geometry2, material2 );
const box2 = new THREE.Box3();
mesh2.position.set(0, 50, -3000);
scene.add(mesh2);

const geometry3 = new THREE.BoxGeometry(400, 10, 400);
const material3 = new THREE.MeshStandardMaterial( { roughness: 0, metalness: 1, color: 0x008000 } );
const mesh3 = new THREE.Mesh( geometry3, material3 );
const box3 = new THREE.Box3();
mesh3.position.set(500, 5, 0);
scene.add(mesh3);

function animate() {
	requestAnimationFrame( animate );

	player.update();

	if (box1.intersectsBox(box2)) {
		let [collision, simplex] = GJK(mesh1, mesh2);
		
		if (collision == true) {
			//console.log(true);
			const rebound = 0.8;

			let [normal, penetrationDepth] = EPA(simplex, mesh1, mesh2);
			const offset = normal.clone().multiplyScalar(penetrationDepth);
			
			player.camera.position.sub(offset);

			player.velocity.reflect(normal.clone());
			player.velocity.multiplyScalar(rebound);

			
			//player.velocity.add(offset.multiplyScalar(rebound));
			box1.setFromObject(mesh1);
		} else {
		//console.log(false);
		mesh2.material.color.setHex( 0x008000 );
		}
	}

	if (box1.intersectsBox(box3)) {
		let [collision, simplex] = GJK(mesh1, mesh3);
		
		if (collision == true) {
			//console.log(true);
			const rebound = 0.8;

			let [normal, penetrationDepth] = EPA(simplex, mesh1, mesh3);
			const offset = normal.clone().multiplyScalar(penetrationDepth);
			
			player.camera.position.sub(offset);

			player.velocity.reflect(normal.clone());
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
	box3.setFromObject(mesh3);

	renderer.render( scene, player.camera );
}

animate();
