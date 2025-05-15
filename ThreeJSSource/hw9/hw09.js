import * as THREE from 'three';  
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();

// 텍스처 로더 생성
const textureLoader = new THREE.TextureLoader();

// Camera를 perspective와 orthographic 두 가지로 switching 해야 해서 const가 아닌 let으로 선언
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 120;
camera.position.y = 20;
camera.position.z = 0;
camera.lookAt(scene.position);
scene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(new THREE.Color(0x000000));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const stats = new Stats();
document.body.appendChild(stats.dom);

// Camera가 바뀔 때 orbitControls도 바뀌어야 해서 let으로 선언
let orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(50, 40, 0);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x292929);
scene.add(ambientLight);

// GUI
const gui = new GUI();

// 행성 데이터
const planets = {
    Sun: {
        radius: 10,
        color: 0xffff00,
        material: new THREE.MeshStandardMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5,
            roughness: 0.5,
            metalness: 0.5
        })
    },
    Mercury: {
        rotationSpeed: 0.02,
        orbitSpeed: 0.02,
        orbitAngle: 0,
        radius: 1.5,
        distance: 20,
        color: 0xa6a6a6,
        material: new THREE.MeshStandardMaterial({
            map: textureLoader.load('Mercury.jpg'),
            color: 0xa6a6a6,
            roughness: 0.8,
            metalness: 0.2
        })
    },
    Venus: {
        rotationSpeed: 0.015,
        orbitSpeed: 0.015,
        orbitAngle: 0,
        radius: 3,
        distance: 35,
        color: 0xe39e1c,
        material: new THREE.MeshStandardMaterial({
            map: textureLoader.load('Venus.jpg'),
            color: 0xe39e1c,
            roughness: 0.8,
            metalness: 0.2
        })
    },
    Earth: {
        rotationSpeed: 0.01,
        orbitSpeed: 0.01,
        orbitAngle: 0,
        radius: 3.5,
        distance: 50,
        color: 0x3498db,
        material: new THREE.MeshStandardMaterial({
            map: textureLoader.load('Earth.jpg'),
            color: 0x3498db,
            roughness: 0.8,
            metalness: 0.2
        })
    },
    Mars: {
        rotationSpeed: 0.008,
        orbitSpeed: 0.008,
        orbitAngle: 0,
        radius: 2.5,
        distance: 65,
        color: 0xc0392b,
        material: new THREE.MeshStandardMaterial({
            map: textureLoader.load('Mars.jpg'),
            color: 0xc0392b,
            roughness: 0.8,
            metalness: 0.2
        })
    }
};

// Camera 컨트롤
const cameraControls = {
    perspective: "Perspective",
    switchCamera: function() {
        if (camera instanceof THREE.PerspectiveCamera) {
            scene.remove(camera);
            camera = null; // 기존의 camera 제거    
            // OrthographicCamera(left, right, top, bottom, near, far)
            camera = new THREE.OrthographicCamera(window.innerWidth / -16, 
                window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500);
            camera.position.x = 120;
            camera.position.y = 20;
            camera.position.z = 0;
            camera.lookAt(scene.position);
            orbitControls.dispose(); // 기존의 orbitControls 제거
            orbitControls = null;
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            this.perspective = "Orthographic";
        } else {
            scene.remove(camera);
            camera = null; 
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.x = 120;
            camera.position.y = 20;
            camera.position.z = 0;
            camera.lookAt(scene.position);
            orbitControls.dispose(); // 기존의 orbitControls 제거
            orbitControls = null;
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            this.perspective = "Perspective";
        }
        orbitControls.object = camera;
    }
};

// Camera 폴더 추가
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(cameraControls, 'switchCamera');
cameraFolder.add(cameraControls, 'perspective').listen();
cameraFolder.open();

// 행성별 폴더 생성
for (const [planetName, planet] of Object.entries(planets)) {
    if (planetName !== 'Sun') {
        const planetFolder = gui.addFolder(planetName);
        planetFolder.add(planet, 'rotationSpeed', 0, 0.1).name('Rotation Speed');
        planetFolder.add(planet, 'orbitSpeed', 0, 0.1).name('Orbit Speed');
        planetFolder.open();
    }
}

// 행성 생성 함수
function createPlanet(planetData) {
    const geometry = new THREE.SphereGeometry(planetData.radius, 32, 32);
    const mesh = new THREE.Mesh(geometry, planetData.material);
    if (planetData.distance) {
        mesh.position.x = planetData.distance;
    }
    scene.add(mesh);
    return mesh;
}

// 행성들 생성
for (const [name, data] of Object.entries(planets)) {
    data.mesh = createPlanet(data);
}

function animate() {
    // stats와 orbitControls는 매 frame마다 update 해줘야 함
    stats.update();
    orbitControls.update();

    // 행성들의 회전과 공전
    for (const [planetName, planet] of Object.entries(planets)) {
        if (planet.distance) {
            // 자전 (y축 중심으로만 회전)
            planet.mesh.rotation.y += planet.rotationSpeed;
            
            // 공전
            planet.orbitAngle -= planet.orbitSpeed*Math.PI;
            planet.mesh.position.x = planet.distance * Math.cos(planet.orbitAngle);
            planet.mesh.position.z = planet.distance * Math.sin(planet.orbitAngle);
        }
    }

    // 모든 transformation 적용 후, renderer에 렌더링
    renderer.render(scene, camera);

    // 다음 frame을 위해 requestAnimationFrame 호출
    requestAnimationFrame(animate);
}

animate();
