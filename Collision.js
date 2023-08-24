import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

/* class Simplex {
    constructor() {
        this.points = new Array();
    }

    pushFront(point) {
        if (this.points.length < 4) {
            this.points.unshift(point);
        } else {
            this.points[3].set(this.points[2]);
            this.points[2].set(this.points[1]);
            this.points[1].set(this.points[0]);
            this.points[0].set(point);
        }
    }
} */

/* class Collision {
    constructor() {
        this.direction;
        this.simplex;
        this.support;
    }

Support(collider1, collider2, direction) {
    let shape1 = BufferGeometryUtils.mergeVertices(collider1.geometry, 3).attributes.position.array; //.geometry.position.array;
    let vertices1 = new Array();

    let shape2 = BufferGeometryUtils.mergeVertices(collider2.geometry, 3).attributes.position.array; //.geometry.position.array;
    let vertices2 = new Array();

    for (let i = 0; i < shape1.length; i=i+3) {
        let vertex = new THREE.Vector3(shape1[i], shape1[i+1], shape1[i+2]);
        vertices1.push(collider1.localToWorld(vertex));
    }
    
    for (let i = 0; i < shape2.length; i=i+3) {
        let vertex = new THREE.Vector3(shape2[i], shape2[i+1], shape2[i+2])
        vertices2.push(collider2.localToWorld(vertex));
    }

	let furthest1 = this.FindFurthestPoint(vertices1, direction);
	let furthest2 = this.FindFurthestPoint(vertices2, -direction);

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
	this.simplex = [this.support]

    //console.log(this.support);

	this.direction = new THREE.Vector3(-this.support.x, -this.support.y, -this.support.z);
	
	while (true) {
		this.support = this.Support(collider1, collider2, this.direction);

		if (this.support.dot(this.direction) <= 0) {
            return false;
		}

		if (this.simplex.length < 4) {
            this.simplex.unshift(this.support);
        } else {
            this.simplex[3].set(this.simplex[2]);
            this.simplex[2].set(this.simplex[1]);
            this.simplex[1].set(this.simplex[0]);
            this.simplex[0].set(this.support);
        }

 		if (this.NextSimplex()) {
			return true;
		}
	}
}

NextSimplex() {
	switch (this.simplex.length) {
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
	a.copy(this.simplex[0]);
	b.copy(this.simplex[1]);

	let ab = a.sub(b)
	let ao = new THREE.Vector3(-a.x, -a.y, -a.z);

	if (this.SameDirection(ab, ao)) {
		this.direction = ab.cross(ao).cross(ab)
	} else {
		this.simplex.pop();
        this.simplex[0] = a;
		this.direction = ao;
	}

    console.log('Entering Line method');
console.log('Current simplex:', this.simplex);
console.log('Current direction:', this.direction);

	return false;
}

Triangle() {
    let a = this.simplex[0];
    let b = this.simplex[1];
    let c = this.simplex[2];

    let ab = b.sub(a);
    let ac = c.sub(a);
    let ao = new THREE.Vector3(-a.x, -a.y, -a.z);

    let abc = ab.cross(ac);

    if (this.SameDirection(abc.cross(ac), ao)) {
        if (this.SameDirection(ac, ao)) {
            this.simplex.pop();
            this.simplex[0] = a;
            this.simplex[1] = b;
            this.direction = ac.cross(ao).cross(ac);
        } else {
            this.simplex.pop();
            return this.Line();
        }
    } else {
        if (this.SameDirection(ab.cross(abc), ao)) {
            this.simplex.pop();
            return this.Line()
        } else {
            if (this.SameDirection(abc, ao)) {
                this.direction = abc;
            } else {
                this.simplex.pop();
                this.simplex[0] = a;
                this.simplex[1] = b;
                this.simplex[2] = c;
                this.direction = new THREE.Vector3(-abc.x, -abc.y, -abc.z);
            }
        }
    }

    console.log('Entering Line method');
    console.log('Current simplex:', this.simplex);
    console.log('Current direction:', this.direction);

    return false;
}

Tetrahedron() {
    let a = this.simplex[0];
    let b = this.simplex[1];
    let c = this.simplex[2];
    let d = this.simplex[3];

    let ab = b.sub(a);
    let ac = c.sub(a);
    let ad = d.sub(a);
    let ao = new THREE.Vector3(-a.x, -a.y, -a.z);

    let abc = ab.cross(ac);
    let acd = ac.cross(ad);
    let adb = ad.cross(ab);

    if (this.SameDirection(abc, ao)) {
        this.simplex.pop();
        this.simplex[0].copy(a);
        this.simplex[1].copy(b);
        this.simplex[2].copy(c);
        return this.Triangle();
    } else if (this.SameDirection(acd, ao)) {
        this.simplex.pop();
        this.simplex[0].copy(a);
        this.simplex[1].copy(c);
        this.simplex[2].copy(d);
        return this.Triangle();
    } else if (this.SameDirection(adb, ao)) {
        this.simplex.pop();
        this.simplex[0].copy(a);
        this.simplex[1].copy(d);
        this.simplex[2].copy(b);
        return this.Triangle()
    }

    console.log('Entering Line method');
console.log('Current simplex:', this.simplex);
console.log('Current direction:', this.direction);

    return true;
}

} */

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

export default GJK;