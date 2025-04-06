/*-------------------------------------------------------------------------

---------------------------------------------------------------------------*/
import { resizeAspectRatio,  Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

let isInitialized = false;
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let cubeVAO;
let rotationAngle=0;
let Sun, Earth, Moon;
let axes = new Axes(gl, 1.0); 
let lastTime = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
        requestAnimationFrame(animate);
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.4, 1.0);
    
    return true;
}


function setupCubeBuffers(shader) {
    const cubeVertices = new Float32Array([
        -0.5,  0.5,  // 좌상단
        -0.5, -0.5,  // 좌하단
         0.5, -0.5,  // 우하단
         0.5,  0.5   // 우상단
    ]);

    const indices = new Uint16Array([
        0, 1, 2,    // 첫 번째 삼각형
        0, 2, 3     // 두 번째 삼각형
    ]);

    cubeVAO = gl.createVertexArray();
    gl.bindVertexArray(cubeVAO);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
}


function getTransformMatrices() {
    const S_sun = mat4.create();
    const R_sun = mat4.create();
    Sun = mat4.create();

    const S_earth = mat4.create();
    const R_earth = mat4.create();
    const T_earth = mat4.create();
    Earth = mat4.create();

    const S_moon = mat4.create();
    const R_moon = mat4.create();
    const T_moon = mat4.create();
    Moon = mat4.create();

    // Sun
    mat4.rotate(R_sun, R_sun, rotationAngle* (1/4), [0, 0, 1]); //45 degree/sec
    mat4.scale(S_sun, S_sun, [0.2, 0.2, 1]);
    mat4.multiply(Sun, R_sun, S_sun);

    // Earth
    mat4.rotate(T_earth, T_earth, rotationAngle * (1/6), [0, 0, 1]); //30 degree/sec
    mat4.translate(T_earth, T_earth, [0.7, 0.0, 0.0]);
    mat4.rotate(R_earth, R_earth, rotationAngle, [0, 0, 1]); //180 degree/sec
    mat4.scale(S_earth, S_earth, [0.1, 0.1, 1]);
    mat4.multiply(Earth, R_earth, S_earth);
    mat4.multiply(Earth, T_earth, Earth);

    // Moon
    mat4.rotate(T_moon, T_moon, rotationAngle*2, [0, 0, 1]); //360 degree/sec
    mat4.translate(T_moon, T_moon, [0.2, 0.0, 0.0]);
    mat4.rotate(R_moon, R_moon, rotationAngle, [0, 0, 1]); //180 degree/sec
    mat4.scale(S_moon, S_moon, [0.05, 0.05, 1]);
    mat4.multiply(Moon, R_moon, S_moon); //스케일, 자전
    mat4.multiply(Moon, T_moon, Moon);
    mat4.multiply(Moon, T_earth, Moon); //지구 중심 위치로로
    
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // axes 그리기
    axes.draw(mat4.create(), mat4.create()); // 두 개의 identity matrix를 parameter로 전달

    shader.use();
    getTransformMatrices();

    // sun 그리기
    shader.setVec4("u_color", [1.0, 0.0, 0.0, 1.0]);
    shader.setMat4("u_model", Sun);
    gl.bindVertexArray(cubeVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    // earth 그리기
    shader.setVec4("u_color", [0.0, 1.0, 1.0, 1.0]);
    shader.setMat4("u_model", Earth);
    gl.bindVertexArray(cubeVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    // moon 그리기
    shader.setVec4("u_color", [1.0, 1.0, 0.0, 1.0]);
    shader.setMat4("u_model", Moon);
    gl.bindVertexArray(cubeVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

}

function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    rotationAngle += Math.PI * deltaTime; //180 degree/sec

    render();
    requestAnimationFrame(animate);
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }
        
        shader=await initShader();
        setupCubeBuffers(shader);
        shader.use();
        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}
