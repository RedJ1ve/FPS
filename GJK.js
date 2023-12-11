import * as THREE from 'three';
import { Support , SameDirection } from "./Support.js";


const epsilon = 1e-6;

function GJK(colliderA, colliderB) {
    let support = Support(colliderA, colliderB, new THREE.Vector3(1, 0, 0));

    let points = [ support.clone() ];

    let direction = support.clone().negate();

    while(true) {

        support.copy(Support(colliderA, colliderB, direction));

        if (support.dot(direction) <= epsilon) {
            return {
                'collision': false,
                'simplex': points
            };
        }

        points.unshift(support.clone());
        
        if (points.length > 4) {
            points.length = 4;
        }

        if(NextSimplex(points, direction)) {
            return {
                'collision': true,
                'simplex': points
            };
        }
    }
}

function NextSimplex(points, direction) {

    switch(points.length) {
        case 2: return Line(points, direction);
        case 3: return Triangle(points, direction);
        case 4: return Tetrahedron(points, direction);
    }

    return false;
}

function Line(points, direction) {
    let a = points[0].clone();
    let b = points[1].clone();

    let ab = b.clone().sub(a);
    let ao = a.clone().negate();

    if (SameDirection(ab, ao)) {
        direction.copy((ab.clone().cross(ao)).cross(ab));
    }

    else {
        points.length = 1;  // Modify the original array
        points[0].copy(a);
        direction.copy(ao);
    }

    return false;
}

function Triangle(points, direction) {
    let a = points[0].clone();
    let b = points[1].clone();
    let c = points[2].clone();

    let ab = b.clone().sub(a);
    let ac = c.clone().sub(a);
    let ao = a.clone().negate();

    let abc = ab.clone().cross(ac);

    if (SameDirection(abc.clone().cross(ac), ao.clone())) {
        if (SameDirection(ac, ao)) {
            points.length = 2;  // Modify the original array
            points[0].copy(a);
            points[1].copy(c);
            direction.copy((ac.clone().cross(ao)).cross(ac));
        }

        else {
            points.length = 2;  // Modify the original array
            points[0].copy(a);
            points[1].copy(b);
            return Line(points, direction);
        }
    }

    else {
        if (SameDirection(ab.clone().cross(abc), ao.clone())) {
            points.length = 2;  // Modify the original array
            points[0].copy(a);
            points[1].copy(b);
            return Line(points, direction);
        }

        else {
            if (SameDirection(abc.clone(), ao.clone())) {
                direction.copy(abc);
            }

            else {
                points.length = 3;  // Modify the original array
                points[0].copy(a);
                points[1].copy(c);
                points[2].copy(b);
                direction.copy(abc.clone().negate());
            }
        }
    }

    return false;
}

function Tetrahedron(points, direction) {
    let a = points[0].clone()
    let b = points[1].clone()
    let c = points[2].clone()
    let d = points[3].clone()

    let ab = b.clone().sub(a);
    let ac = c.clone().sub(a);
    let ad = d.clone().sub(a);
    let ao = a.clone().negate();

    let abc = ab.clone().cross(ac);
    let acd = ac.clone().cross(ad);
    let adb = ad.clone().cross(ab);

    if (SameDirection(abc.clone(), ao.clone())) {
        points.length = 3;  // Modify the original array
        points[0].copy(a);
        points[1].copy(b);
        points[2].copy(c);
        return Triangle(points, direction);
    }

    if (SameDirection(acd.clone(), ao.clone())) {
        points.length = 3;  // Modify the original array
        points[0].copy(a);
        points[1].copy(c);
        points[2].copy(d);
        return Triangle(points, direction);
    }

    if (SameDirection(adb.clone(), ao.clone())) {
        points.length = 3;  // Modify the original array
        points[0].copy(a);
        points[1].copy(d);
        points[2].copy(b);
        return Triangle(points, direction);
    }

    return true;
}

export default GJK;