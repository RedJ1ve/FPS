import * as THREE from 'three';
import Player from './Player.js'
import EPA from './EPA.js';
import GJK from './GJK.js';
import {Support, FindFurthestPoint, SameDirection} from './Support.js';
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
const playerBox = new THREE.Box3();
scene.add(player.camera);

const geometry2 = new THREE.BoxGeometry(4000, 200, 1000);
const material2 = new THREE.MeshStandardMaterial( { roughness: 0, metalness: 1, color: 0x008000 } );
const mesh2 = new THREE.Mesh( geometry2, material2 );
mesh2.position.set(0, 50, -3000);
scene.add(mesh2);

const geometry3 = new THREE.BoxGeometry(400, 10, 400);
const material3 = new THREE.MeshStandardMaterial( { roughness: 0, metalness: 1, color: 0x008000 } );
const mesh3 = new THREE.Mesh( geometry3, material3 );
mesh3.position.set(500, 5, 0);
scene.add(mesh3);

const geometry4 = new THREE.DodecahedronGeometry(80, 0);
const material4 = new THREE.MeshStandardMaterial( { roughness: 0, metalness: 1, color: 0x008000 } );
const mesh4 = new THREE.Mesh( geometry4, material4 );
mesh4.position.set(-500, 20, 0);
scene.add(mesh4);

const geometry5 = new THREE.DodecahedronGeometry(80, 1);
const material5 = new THREE.MeshStandardMaterial( { roughness: 0, metalness: 1, color: 0x008000 } );
const mesh5 = new THREE.Mesh( geometry5, material5 );
mesh5.position.set(0, 5, -500);
scene.add(mesh5);

const geometry6 = new THREE.TorusGeometry(200, 50, 9, 11, 2* Math.PI);
const material6 = new THREE.MeshStandardMaterial( { roughness: 0, metalness: 1, color: 0x008000 } );
const mesh6 = new THREE.Mesh( geometry6, material6 );
mesh6.position.set(-500, 5, -500);
scene.add(mesh6);


function PlayerCollision(collider) {
	let colliderBox = new THREE.Box3();
	colliderBox.setFromObject(collider);

	if (playerBox.intersectsBox(colliderBox)) {
		let [collision, simplex] = GJK(mesh1, collider);
		
		if (collision == true) {
			//console.log(true);
			const rebound = 0.8;

			let [normal, penetrationDepth] = EPA(simplex, mesh1, collider);
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
}

function animate() {
	requestAnimationFrame( animate );

	player.update();

	PlayerCollision(mesh2);
	PlayerCollision(mesh3);
	PlayerCollision(mesh4);
	PlayerCollision(mesh5);
	PlayerCollision(mesh6);

	playerBox.setFromObject(mesh1);

	renderer.render( scene, player.camera );
}

animate();
