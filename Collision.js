import * as THREE from 'three';

class Simplex {
    constructor() {
        this.points = [
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3()
        ];

        this.size = 0;
    }

    pushFront(point) {
        this.points = [
            point,
            this.points[0],
            this.points[1],
            this.points[2]
        ];
        this.size = Math.min(this.size + 1, 4);
    }
}

class Collision {
    constructor() {
        this.direction;
        this.simplex;
        this.support;
    }

Support(collider1, collider2, direction) {
    let shape1 = collider1.geometry.attributes.position.array;
    let vertices1 = new Array();

    let shape2 = collider2.geometry.attributes.position.array;
    let vertices2 = new Array();

    for (let i = 0; i < shape1.length; i=i+3) {
        vertices1.push(new THREE.Vector3(shape1[i], shape1[i+1], shape1[i+2]));
    }

    console.log(vertices1)

    for (let i = 0; i < shape2.length; i=i+3) {
        vertices2.push(new THREE.Vector3(shape2[i], shape2[i+1], shape2[i+2]));
    }

	let furthest1 = this.FindFurthestPoint(vertices1, direction);
	let furthest2 = this.FindFurthestPoint(vertices2, direction);

    return (furthest1.sub(furthest2));
}

FindFurthestPoint(vertices, direction) {
    let maxPoint = new THREE.Vector3();
    let maxDistance = -Infinity;

    for (let i =0; i < vertices.length; i++) {
        let distance = vertices[i].dot(direction);

        if (distance > maxDistance) {
            maxDistance = distance;
            maxPoint.copy(vertices[i]);
        }
    }

    return maxPoint;
}

GJK(collider1, collider2) {
    this.support = this.Support(collider1, collider2, new THREE.Vector3(1, 0, 0));
	this.simplex = new Simplex()
	this.simplex.pushFront(this.support);

	this.direction = new THREE.Vector3(-this.support.x, -this.support.y, -this.support.z);
	
	while (true) {
		this.support = this.Support(collider1, collider2, this.direction);

		if (this.support.dot(this.direction) <= 0) {
            return false;
		}

		this.simplex.pushFront(this.support);

		if (this.NextSimplex()) {
			return true;
		}
	}
}

NextSimplex() {
	switch (this.simplex.size) {
		case 2: return this.Line();
		case 3: return this.Triangle();
		case 4: return this.Tetrahedron();
	}

	return false;
}

SameDirection(direction1, direction2) {
	return direction1.dot(direction2) > 0;
}

Line() {
	let a = new THREE.Vector3();
	let b = new THREE.Vector3();
	a.copy(this.simplex.points[0]);
	b.copy(this.this.simplex.points[1]);

	let ab = a.sub(b)
	let ao = new THREE.Vector3(-a.x, -a.y, -a.z);

	if (this.SameDirection(ab, ao)) {
		this.direction = ab.cross(ao).cross(ab)
	} else {
		this.simplex.points = [ a ];
		this.direction = ao;
	}

	return false;
}

Triangle() {
    a = this.simplex.points[0];
    b = this.simplex.points[1];
    c = this.simplex.points[2];

    ab = b.sub(a);
    ac = c.sub(a);
    ao = new THREE.Vector3(-a.x, -a.y, -a.z);

    abc = ab.cross(ac);

    if (this.SameDirection(abc.cross(ac), ao)) {
        if (this.SameDirection(ac, ao)) {
            this.simplex.points = [ a, c ];
            this.direction = ac.cross(ao).cross(ac);
        } else {
            this.simplex.points = [ a, b ];
            return this.Line();
        }
    } else {
        if (this.SameDirection(ab.cross(abc), ao)) {
            this.simplex.points = [ a, b ];
            return this.Line()
        } else {
            if (this.SameDirection(abc, ao)) {
                this.direction = abc;
            } else {
                this.simplex.points = [ a, b, c ];
                this.direction = new THREE.Vector3(-abc.x, -abc.y, -abc.z);
            }
        }
    }
    return false;
}

Tetrahedron() {
    let a = this.simplex.points[0];
    let b = this.simplex.points[1];
    let c = this.simplex.points[2];
    let d = this.simplex.points[3];

    let ab = b.sub(a);
    let ac = c.sub(a);
    let ad = d.sub(a);
    let ao = new THREE.Vector3(-a.x, -a.y, -a.z);

    let abc = ab.cross(ac);
    let acd = ac.cross(ad);
    let adb = ad.cross(ab);

    if (this.SameDirection(abc, ao)) {
        this.simplex.points = [ a, b, c ];
        this.Triangle();
    } if (this.SameDirection(acd, ao)) {
        this.simplex.points = [ a, c, d ];
        this.Triangle();
    } if (this.SameDirection(adb, ao)) {
        this.simplex.points = [ a, d, b ];
    }

    return true;
}

}

export default Collision;