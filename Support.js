import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

function Support(collider1, collider2, direction) {
    let point1 = FindFurthestPoint(collider1, direction.clone().normalize());
    let point2 = FindFurthestPoint(collider2, direction.clone().normalize().negate());

    return point1.sub(point2);
}

function FindFurthestPoint(collider, direction) {
    let shape = BufferGeometryUtils.mergeVertices(collider.geometry, 3).attributes.position.array;
    let vertices = new Array();

    for (let i = 0; i < shape.length; i=i+3) {
        let vertex = new THREE.Vector3(shape[i], shape[i+1], shape[i+2]);
        vertices.push(collider.localToWorld(vertex));
    }

    let maxPoint = new THREE.Vector3();
    let maxDistance = -Number.MAX_VALUE;

    for (const point of vertices) {
        let distance = point.dot(direction);

        if (distance > maxDistance) {
            maxDistance = distance;
            maxPoint.copy(point);
        }
    }

    return maxPoint;
}

function SameDirection(directionA, directionB) {
    return directionA.dot(directionB) > 0;
}

export { Support, FindFurthestPoint, SameDirection };