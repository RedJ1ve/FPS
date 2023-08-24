import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

/*
COLLISION DETECTION
*/

function GJK(collider1, collider2) {
    let simplex = [
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
    ];
    let n = 2;

    let direction = new THREE.Vector3(1, 0, 0);
    simplex[1] = support(collider1, collider2, direction);

    if (simplex[1].dot(direction) < 0) {
        return false;
    }

    direction = simplex[1].clone().negate();
    simplex[0] = support(collider1, collider2, direction);

    if (simplex[0].dot(direction) < 0) {
        return false;
    }

    let temp1 = simplex[1].clone().sub(simplex[0]);
    let temp2 = simplex[0].clone().negate();
    direction = temp1.clone().cross(temp2).cross(temp1);

    for (let i = 0; i < 64; i++) {
        let a = support(collider1, collider2, direction);

        if (a.dot(direction) < 0) {
            return false;
        }

        if (n == 2) {
            let ao = a.clone().negate();
            let ab = simplex[0].clone().sub(a);
            let ac = simplex[1].clone().sub(a);
            let abc = ab.clone().cross(ac);

            let abp = ab.clone().cross(abc);

            if (abp.dot(ao) > 0) {
                simplex[1] = simplex[0];
                simplex[0] = a.clone();
                direction = ab.clone().cross(ao).cross(ab);

                continue;
            }

            let acp = abc.clone().cross(ac);

            if (acp.dot(ao) > 0) {
                simplex[0] = a.clone();
                direction = ac.clone().cross(ao).cross(ac);

                continue;
            }
            
            if (abc.dot(ao) > 0) {
                simplex[2] = simplex[1];
                simplex[1] = simplex[0];
                simplex[0] = a.clone();
                direction = abc.clone().negate();
            } else {
                simplex[2] = simplex[0];
                simplex[0] = a.clone();
                direction = abc.clone().negate();
            }

            n = 3;
            continue;
        }

        let ao = a.clone().negate();
        let ab = simplex[0].clone().sub(a);
        let ac = simplex[1].clone().sub(a);
        let ad = simplex[2].clone().sub(a);

        let abc = ab.clone().cross(ac);
        let acd = ac.clone().cross(ad);
        let adb = ad.clone().cross(ab);

        function line() {
            if(ab.clone().cross(abc).dot(ao) > 0) {
                simplex[1] = simplex[0];
                simplex[0] = a.clone();
                direction = ab.clone().cross(ao).cross(ab)
                n = 2;
            } else {
                simplex[2] = simplex[1];
                simplex[1] = simplex[0];
                simplex[0] = a.clone();
                direction = abc.clone();
            }
        }

        function triangle() {
            if (abc.clone().cross(ac).dot(ao) > 0) {
                simplex[0] = a.clone()
                direction - ac.clone().cross(ao).cross(ac);
                n = 2;
            } else {
                line();
            }
        }

        function tetrahedron() {
            if (abc.clone().cross(ac).dot(ao) > 0) {
                simplex[0] = simplex[1];
                simplex[1] = simplex[2].clone();

                ab = ac;
                ac = ad.clone()
                abc = acd.clone();

                triangle();
            } else {
                line();
            }
        }

        let ABC = 1;
        let ACD = 2;
        let ADB = 4;

        let tests = ((abc.dot(ao) > 0)? ABC : 0) | ((acd.dot(ao) > 0)? ACD : 0) | ((adb.dot(ao) > 0)? ADB : 0);

        if (tests == 0) {
            return true;
        } else if (tests = ABC) {
            triangle();
        } else if (tests == ACD) {
            simplex[0] = simplex[1];
            simplex[1] = simplex[2].clone();

            ab = ac;
            ac = ad.clone();
            abc = acd.clone();

            triangle();
        } else if (tests = ADB) {
            simplex[1] = simplex[0];
            simplex[0] = simplex[2].clone();

            ac = ab;
            ab = ad.clone();
            abc = adb.clone();

            triangle();
        } else if (tests == ABC | ACD) {
            tetrahedron();
        } else if (tests = ACD | ADB) {
            let temp = simplex[0];
            simplex[0] = simplex[1];
            simplex[1] = simplex[2];
            simplex[2] = temp;

            temp = ab;
            ab = ac;
            ac = ad;
            ad = temp;

            abc = acd;
            acd = adb.clone();

            tetrahedron();
        } else if (tests == ADB | ABC) {
            let temp = simplex[1];
            simplex[1] = simplex[0];
            simplex[0] = simplex[2];
            simplex[2] = temp;

            temp = ac;
            ac = b;
            ab = ad;
            ad = temp;

            acd = abc;
            abc = adb.clone();

            tetrahedron();
        } else {
            return true;
        }

        return true;
    }
}

function support(collider1, collider2, direction) {
    let dir = new THREE.Vector3()
    dir.copy(direction.normalize());

    let point1 = findFurthestPoint(collider1, dir);
    let point2 = findFurthestPoint(collider2, dir.negate());

    return point1.clone().sub(point2);
}

function findFurthestPoint(collider, direction) {
    let shape = BufferGeometryUtils.mergeVertices(collider.geometry, 3).attributes.position.array;
    let vertices = new Array();

    for (let i = 0; i < shape.length; i=i+3) {
        let vertex = new THREE.Vector3(shape[i], shape[i+1], shape[i+2]);
        vertices.push(collider.localToWorld(vertex));
    }

    let longest = vertices[0].clone();
    let length = longest.dot(direction);

    for (let i = 1; i < vertices.length; i++) {
        let tempLongest = vertices[i].clone();
        let tempLength = tempLongest.dot(direction);

        if (tempLength > length) {
            longest = tempLongest;
            length = tempLength;
        }
    }

    return longest;
}

/*
COLLISION RESOLUTION
*/

function EPA(simplex, collider1, collider2) {
    let minIndex = 0;
    let minDistance = Infinity;
    let minNormal;

    while (minDistance == Infinity) {
        for (let i = 0; i < simplex.length; i++) {
            let j = (i+1) % simplex.length;

            let vertexI = simplex[i].copy();
            let vertexJ = simplex[j].copy();

            let ij = vertexJ.copy().sub(vertexI);

            let normal = new THREE.Vector3(ij.y, )
        }
    }
}

export default GJK;