// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 500, 1000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight.position.set(100, 100, 50);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.far = 500;
sunLight.shadow.camera.left = -200;
sunLight.shadow.camera.right = 200;
sunLight.shadow.camera.top = 200;
sunLight.shadow.camera.bottom = -200;
scene.add(sunLight);

// Ground (Grass)
const grassGeometry = new THREE.PlaneGeometry(400, 400);
const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
const grass = new THREE.Mesh(grassGeometry, grassMaterial);
gras.rotation.x = -Math.PI / 2;
gras.receiveShadow = true;
scene.add(grass);

// Road
const roadGeometry = new THREE.PlaneGeometry(30, 200);
const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
road.position.z = 0;
road.receiveShadow = true;
scene.add(road);

// Road lines
const lineGeometry = new THREE.PlaneGeometry(0.5, 10);
const lineMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
for (let i = -10; i < 10; i++) {
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.rotation.x = -Math.PI / 2;
    line.position.z = i * 10;
    line.position.y = 0.01;
    scene.add(line);
}

// Car
const carGroup = new THREE.Group();
scene.add(carGroup);

const carBody = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1.5, 4),
    new THREE.MeshPhongMaterial({ color: 0xff0000 })
);
carBody.position.y = 0.75;
carBody.castShadow = true;
carBody.receiveShadow = true;
carGroup.add(carBody);

// Car roof
const roofGeometry = new THREE.BoxGeometry(1.8, 0.8, 2);
const roofMaterial = new THREE.MeshPhongMaterial({ color: 0xcc0000 });
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.position.y = 1.7;
roof.position.z = -0.3;
roof.castShadow = true;
roof.receiveShadow = true;
carGroup.add(roof);

// Wheels
const wheels = [];
const wheelPositions = [
    { x: -1, z: 1 },
    { x: 1, z: 1 },
    { x: -1, z: -1 },
    { x: 1, z: -1 }
];

wheelPositions.forEach(pos => {
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos.x, 0.5, pos.z);
    wheel.castShadow = true;
    wheel.receiveShadow = true;
    carGroup.add(wheel);
    wheels.push(wheel);
});

// Car physics
const car = {
    speed: 0,
    maxSpeed: 0.5,
    acceleration: 0.02,
    friction: 0.95,
    rotation: 0,
    rotationSpeed: 0.05
};

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Handle input
    const forward = keys['arrowup'] || keys['w'];
    const backward = keys['arrowdown'] || keys['s'];
    const left = keys['arrowleft'] || keys['a'];
    const right = keys['arrowright'] || keys['d'];

    if (forward) car.speed = Math.min(car.speed + car.acceleration, car.maxSpeed);
    if (backward) car.speed = Math.max(car.speed - car.acceleration, -car.maxSpeed * 0.5);
    if (!forward && !backward) car.speed *= car.friction;

    if (left) car.rotation += car.rotationSpeed;
    if (right) car.rotation -= car.rotationSpeed;

    // Update car position
    carGroup.position.x += Math.sin(car.rotation) * car.speed;
    carGroup.position.z += Math.cos(car.rotation) * car.speed;
    carGroup.rotation.y = car.rotation;

    // Rotate wheels based on speed
    wheels.forEach(wheel => {
        wheel.rotation.x += car.speed * 0.1;
    });

    // Camera follow
    const cameraDistance = 8;
    const cameraHeight = 3;
    camera.position.x = carGroup.position.x - Math.sin(car.rotation) * cameraDistance;
    camera.position.z = carGroup.position.z - Math.cos(car.rotation) * cameraDistance;
    camera.position.y = carGroup.position.y + cameraHeight;
    camera.lookAt(carGroup.position.x, carGroup.position.y + 0.5, carGroup.position.z);

    // Update HUD
    document.getElementById('speed').textContent = 'Speed: ' + Math.round(Math.abs(car.speed) * 100) + ' km/h';

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();