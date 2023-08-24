import * as THREE from 'three';
import Player from './Player.js'
import GJK from './Collision.js';

const scene = new THREE.Scene();
// const collision = new Collision();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

/* const loader = new THREE.TextureLoader()
const skyTexture.load = loader.load(
	'./public/skybox.png',
	() => {
		texture.mapping = THREE.EquirectangularReflectionMapping;
		texture.colorSpace = THREE.SRGBColorSpace;
		scene.background = texture;
}); */


const gridHelper = new THREE.GridHelper(40000, 1400);
scene.add( gridHelper );

let player = new Player();

player.camera.position.set(0, 20, 0);

const geometry1 = new THREE.BoxGeometry( 10, 15, 10 );
const material1 = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const mesh1 = new THREE.Mesh( geometry1, material1 );
const boxHelper1 = new THREE.BoxHelper(mesh1, 0x008000);
const box1 = new THREE.Box3();
scene.add(mesh1);
scene.add(boxHelper1);

const geometry2 = new THREE.BoxGeometry(40, 40, 40);
const material2 = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const mesh2 = new THREE.Mesh( geometry2, material2 );
const boxHelper2 = new THREE.BoxHelper(mesh2, 0x008000);
const box2 = new THREE.Box3();
mesh2.position.set(0, 20, 300);
scene.add(mesh2);
scene.add(boxHelper2);

function animate() {
	requestAnimationFrame( animate );

	player.update();
	mesh1.position.set(player.camera.position.x, player.camera.position.y - 10, player.camera.position.z - 30)
	mesh1.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), player.euler.y);
	boxHelper1.update()
	boxHelper2.update()
	box1.setFromObject(mesh1);
	box2.setFromObject(mesh2);

	if (box1.intersectsBox(box2)) {
		console.log(GJK(mesh1, mesh2));
	} else {
		console.log(false);
	}
	renderer.render( scene, player.camera );
}

animate();