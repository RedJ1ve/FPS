import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

/*
COLLISION DETECTION
*/

function GJK(collider1, collider2, full) {
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

        if (full == true) {
            EPA(simplex, n, collider1, collider2);
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

function EPA(simplex, n, collider1, collider2) {
    let polytope = new Array;

    for (i = 0; i < n; i++) {
        polytope.push(simplex[i]);
    }

    let faces = [
        0, 1, 2,
        0, 3, 1,
        0, 2, 3,
        1, 3, 2
    ];

    let faceNormals = GetFaceNormals(polytope, faces);

    let normals = faceNormals[0];
    let minFace = faceNormals[1];

    let minNormal = new THREE.Vector3();
    let minDistance = Infinity;

    while (minDistance == Infinity) {
        minNormal.set(normals[minFace].x, normals[minFace].y, normals[minFace].z);
        minDistance = normals[minFace].w;

        let support = Support(collider1, collider2, minNormal);
        let sDistance = minNormal.dot(support);

        if (Math.abs(sDistance - minDistance) > 0.00001) {
            minDistance = Infinity;

            let uniqueEdges = new Array;

            for (let i = 0; i < normals.length(); i++) {
                if (SameDirection(normals[i], support)) {
                    let f = i * 3;

                    AddIfUniqueEdge(uniqueEdges, faces, f, f + 1);
                    AddIfUniqueEdge(uniqueEdges, faces, f + 1, f + 2);
                    AddIfUniqueEdge(uniqueEdges, faces, f + 2, f);

                    faces[f + 2] = faces.pop();
                    faces[f + 1] = faces.pop();
                    faces[f] = faces.pop();

                    normals[i] = normals.pop();

                    i--;
                }
            }

            let newFaces = new Array[];

            for (let i = 0; i < uniqueEdges.length; i += 2) {
                newFaces.push(uniqueEdges[i]);
                newFaces.push(uniqueEdges[i + 1]);
                newFaces.push(polytope.length);
            }

            polytope.push(support);

            let newFaceNormals = GetFaceNormals(polytope, faces);

            let newNormals = newFaceNormals[0];
            let newMinFace = newFaceNormals[1];

            let oldMinDistance = Infinity;

            for (i = 0; i < normals.length(); i++) {
                if (normals[i].w < oldMinDistance) {
                    oldMinDistance = normals[i].w;
                    minFace = i;
                }
            }

            if (newNormals[newMinFace].w < oldMinDistance) {
                minFace = newMinFace + normals.length();
            }

            faces.concat(newFaces);
            normals.concat(newNormals);
        }
    }

    
}

export default GJK;