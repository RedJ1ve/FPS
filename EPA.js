import * as THREE from 'three';
import { Support } from "./Support.js";

const epsilon = 1e-6;

function EPA (polytope, colliderA, colliderB) {
    let faces = [
        0, 1, 2,
	0, 3, 1,
	0, 2, 3,
	1, 3, 2
    ];

    let faceNormals = GetFaceNormals(polytope, faces);
    let normals = faceNormals.normals;
    let minFace = faceNormals.minTriangle;
    let minNormal = new THREE.Vector3();
    let minDistance = Number.MAX_VALUE;

    while (minDistance === Number.MAX_VALUE) {
        let minNormal = new THREE.Vector3().copy(normals[minFace]);
        let support = Support(colliderA, colliderB, minNormal);
        let sDistance = minNormal.dot(support);

        console.log('support:', support);
        console.log('sDistance:', sDistance);

        if (Math.abs(sDistance - minDistance) > epsilon) {

            minDistance = Number.MAX_VALUE;
            let uniqueEdges = new Array();

            for (let i = 0; i < normals.length; i++) {
                if (normals[i].dot(support) > 0) {
                    let f = i * 3;

                    AddIfUniqueEdge(uniqueEdges, faces, f, f + 1);
                    AddIfUniqueEdge(uniqueEdges, faces, f + 1, f + 2);
                    AddIfUniqueEdge(uniqueEdges, faces, f + 2, f);

                    faces[f + 2] = faces.pop();
                    faces[f + 1] = faces.pop()
                    faces[f] = faces.pop();

                    normals[i] = normals.pop();

                    i--;
                }
            }

            console.log('uniqueEdges:', uniqueEdges);

            let newFaces = new Array();

            for (let [edgeIndex1, edgeIndex2] of uniqueEdges) {
                newFaces.push(edgeIndex1);
                newFaces.push(edgeIndex2);
                newFaces.push(polytope.length);
            }

            console.log('newFaces:', newFaces);

            polytope.push(support);

            let newFaceNormals = GetFaceNormals(polytope, faces);
            let newNormals = newFaceNormals.normals;
            let newMinFace = newFaceNormals.minTriangle;
            let oldMinDistance = Number.MAX_VALUE;

            for (let i = 0; i < normals.length; i++) {
                if (normals[i].w < oldMinDistance) {
                    oldMinDistance = normals[i].w;
                    minFace = i;
                }
            }

            console.log('newNormals:', newNormals);
            console.log('newMinFace:', newMinFace);

            if (newNormals[newMinFace].w < oldMinDistance) {
                minFace = newMinFace + normals.length;
            }

            console.log('minFace:', minFace);

            faces = faces.concat(newFaces);
            normals = normals.concat(newNormals);
        }
    }

    return {
        'normal': minNormal,
        'penetrationDepth': minDistance + 1
    };
}

function GetFaceNormals(polytope, faces) {
    let normals = new Array();
    let minTriangle = 0;
    let minDistance = Number.MAX_VALUE;

    for (let i = 0; i < faces.length; i += 3) {
        let a = polytope[faces[i]].clone();
        let b = polytope[faces[i + 1]].clone();
        let c = polytope[faces[i + 2]].clone();

        let normal = new THREE.Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize();
        let distance = normal.dot(a);

        if (distance < 0) {
            normal.negate();
            distance *= -1;
        }

        normals.push(new THREE.Vector4(normal.x, normal.y, normal.z, distance));

        if (distance < minDistance) {
            minTriangle = i / 3;
            minDistance = distance;
        }
    }

    return { normals, minTriangle };
}

function AddIfUniqueEdge(edges, faces, a, b) {
    let reverse = edges.findIndex(([edgeA, edgeB]) => edgeB === faces[a] && edgeA === faces[b]);

    if (reverse !== -1) {
        edges.splice(reverse, 1);
    } else {
        edges.push([faces[a], faces[b]]);
    }
}

export default EPA;
