/*-------------------------------------------------------------------------

---------------------------------------------------------------------------*/
import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

// Global variables
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let isInitialized = false;  // main이 실행되는 순간 true로 change
let shader;
let vao;
let positionBuffer; // 2D position을 위한 VBO (Vertex Buffer Object)
let isDrawing = false; // mouse button을 누르고 있는 동안 true로 change
let startPoint = null;  // mouse button을 누른 위치
let tempEndPoint = null; // mouse를 움직이는 동안의 위치
let radius
let intersections //교차점
let lines = []; // 그려진 선분들을 저장하는 array
let textOverlay; 
let textOverlay2; 
let textOverlay3;
let axes = new Axes(gl, 0.85); // x, y axes 그려주는 object (see util.js)

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) { // true인 경우는 main이 이미 실행되었다는 뜻이므로 다시 실행하지 않음
        console.log("Already initialized");
        return;
    }

    main().then(success => { // call main function
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
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
    gl.clearColor(0.1, 0.2, 0.3, 1.0);

    return true;
}

function setupBuffers() {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    shader.setAttribPointer('a_position', 2, gl.FLOAT, false, 0, 0); // x, y 2D 좌표

    gl.bindVertexArray(null);
}

function convertToWebGLCoordinates(x, y) {
    return [
        (x / canvas.width) * 2 - 1, 
        -((y / canvas.height) * 2 - 1) 
    ];
}


function setupMouseEvents() {
    function handleMouseDown(event) {
        event.preventDefault(); 
        event.stopPropagation(); 

        const rect = canvas.getBoundingClientRect(); // canvas를 나타내는 rect 객체를 반환
        const x = event.clientX - rect.left;  // canvas 내 x 좌표
        const y = event.clientY - rect.top;   // canvas 내 y 좌표
        
        if (!isDrawing && lines.length < 2) { 

            let [glX, glY] = convertToWebGLCoordinates(x, y);
            startPoint = [glX, glY];
            isDrawing = true; 
        }
    }

    function handleMouseMove(event) {
        if (isDrawing) { // 그리고 있는 도중인 경우
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            let [glX, glY] = convertToWebGLCoordinates(x, y);
            tempEndPoint = [glX, glY]; // 임시 끝 point
            render();
        }
    }

    function handleMouseUp() {
        if (isDrawing && tempEndPoint) {
            lines.push([...startPoint, ...tempEndPoint]); 
            if (lines.length == 1) {//원
                //반지름 구하기
                radius = Math.hypot(lines[0][2] - lines[0][0], lines[0][3] - lines[0][1]);
                updateText(textOverlay, "Circle: center (" + lines[0][0].toFixed(2) + ", " + lines[0][1].toFixed(2) + 
                    ") radius = "+ radius.toFixed(2));
                
            }
            else if (lines.length == 2){ //선
                //선 정보
                updateText(textOverlay2, "Line segment: (" + lines[1][0].toFixed(2) + ", " + lines[1][1].toFixed(2) + 
                    ") ~ (" + lines[1][2].toFixed(2) + ", " + lines[1][3].toFixed(2) + ")");

                //교차점 계산
                const center = lines[0];
                const [x1, y1, x2, y2] = lines[1];
                intersections = Intersections(center[0], center[1], radius, x1, y1, x2, y2);

                if(intersections.length == 2){
                    updateText(textOverlay3, "Interaction point: 2 Point 1: (" + intersections[0][0].toFixed(2) + ", " + intersections[0][1].toFixed(2)+") Point 2: ("
                    +intersections[1][0].toFixed(2) + ", " + intersections[1][1].toFixed(2)+")");
                }
                else if(intersections.length == 1){
                    updateText(textOverlay3, "Interaction point: 1 Point 1: (" + intersections[0][0].toFixed(2) + ", " + intersections[0][1].toFixed(2)+")");
                }
                else{
                    updateText(textOverlay3, "No intersection");
                }
            }

            isDrawing = false;
            startPoint = null;
            tempEndPoint = null;
            render();
        }
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
}

//교차점 계산 함수
function Intersections(cx, cy, r, x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let fx = x1 - cx;
    let fy = y1 - cy;

    let a = dx * dx + dy * dy;
    let b = 2 * (fx * dx + fy * dy);
    let c = fx * fx + fy * fy - r * r;

    let D = b * b - 4 * a * c; //판별식
    if (D < 0) return []; // 교차 없음

    D = Math.sqrt(D); //근의 공식
    let t1 = (-b - D) / (2 * a);
    let t2 = (-b + D) / (2 * a);
    let points = [];

    //범위 내에 교차점 있는지 확인
    if (t1 >= 0 && t1 <= 1) points.push([x1 + t1 * dx, y1 + t1 * dy]);
    if (t2 >= 0 && t2 <= 1 && t2 !== t1) points.push([x1 + t2 * dx, y1 + t2 * dy]);

    return points;
}

function drawCircle(start, temp, color, segments = 100) {
    const A = start[0];
    const B = start[1];
    const X = temp[0];
    const Y = temp[1];
    radius= Math.hypot(A - X, B-Y);

    let vertices = [];
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2 * Math.PI;
        const x = A + radius * Math.cos(theta);
        const y = B + radius * Math.sin(theta);
        vertices.push(x, y);
    }

    shader.setVec4("u_color", color); // 임시 선분의 color는 회색
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.LINE_STRIP, 0, segments + 1);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    shader.use();

    //원 그리기
    if (lines.length >= 1) {
        drawCircle([lines[0][0],lines[0][1]], [lines[0][2],lines[0][3]],[1.0, 0.0, 1.0, 1.0]);
    }

    // 선 그리기
    if (lines.length === 2) {
        shader.setVec4("u_color", [0.0, 0.0, 1.0, 1.0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines[1]), gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINES, 0, 2);

    }

    //교차점 그리기
    if (intersections) {
        for (let pt of intersections) {
            shader.setVec4("u_color", [1.0, 1.0, 0.0, 1.0]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pt), gl.STATIC_DRAW);
            gl.bindVertexArray(vao);
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }

    // 임시 원 그리기
    if (lines.length === 0&&isDrawing && startPoint && tempEndPoint) {
        drawCircle(startPoint, tempEndPoint, [0.5, 0.5, 0.5, 1.0]);
    }

    // 임시 선 그리기
    if (lines.length === 1&&isDrawing && startPoint && tempEndPoint) {
        shader.setVec4("u_color", [0.5, 0.5, 0.5, 1.0]); // 임시 선분의 color는 회색
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...startPoint, ...tempEndPoint]), 
                      gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINES, 0, 2);
    }

    // axes 그리기
    axes.draw(mat4.create(), mat4.create()); // 두 개의 identity matrix를 parameter로 전달
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
            return false; 
        }

        // 셰이더 초기화
        await initShader();
        
        // 나머지 초기화
        setupBuffers();
        shader.use();

        // 텍스트 초기화
        textOverlay = setupText(canvas, "", 1);
        textOverlay2 = setupText(canvas, "", 2);
        textOverlay3 = setupText(canvas, "", 3);
        
        // 마우스 이벤트 설정
        setupMouseEvents();
        
        // 초기 렌더링
        render();

        return true;
        
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}
