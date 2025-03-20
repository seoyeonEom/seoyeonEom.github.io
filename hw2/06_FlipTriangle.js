/*-------------------------------------------------------------------------
1) 처음 실행했을 때, canvas의 크기는 600 x 600 이어야 합니다.
2) 처음 실행했을 때, 정사각형의 한 변의 길이는 0.2 이며, 정사각형은 canvas 중앙
에 위치 합니다.
3) 화살표 key를 한번 누를 때 x 또는 y 방향으로 +0.01 또는 -0.01씩 이동합니다.
4) 이동된 사각형의 좌표는 vertex shader에서 uniform variable을 이용하여 수정합
니다.
5) 정사각형은 index를 사용하지 않고 draw하며 primitive는 TRIANGLE_FAN을 사용
합니다.
6) Shader 들은 독립된 파일로 저장하여 읽어 들여야 합니다.
7) “Use arrow keys to move the rectangle” message를 canvas 위에 표시합니다.
8) resizeAspectRatio() utility function을 이용하여 가로와 세로의 비율이 1:1 을 항상
유지하도록 합니다. 
---------------------------------------------------------------------------*/
import { resizeAspectRatio, setupText, updateText } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let vao;
let position = [0.0, 0.0]; // 정사각형 위치
let textOverlay;  // for text output (see util.js)


function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 600;
    canvas.height = 600;

    resizeAspectRatio(gl, canvas);

    // Initialize WebGL settings
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0,0, 0, 1.0);
    
    return true;
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function setupKeyboardEvents() {
    document.addEventListener('keydown', (event) => {
        const step = 0.01;
        if (position[1]<0.9&&event.key === 'ArrowUp') position[1] += step;
        if (position[1]>-0.9&&event.key === 'ArrowDown') position[1] -= step;
        if (position[0]>-0.9&&event.key === 'ArrowLeft') position[0] -= step;
        if (position[0]<0.9&&event.key === 'ArrowRight') position[0] += step;
    });


}

function setupBuffers(shader) {
    const vertices = new Float32Array([
        -0.1, -0.1, 0.0,  // Bottom left
         0.1, -0.1, 0.0,  // Bottom right
         0.1,  0.1, 0.0,  // Top right
        -0.1,  0.1, 0.0   // Top left
    ]);


    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    shader.setAttribPointer('aPos', 3, gl.FLOAT, false, 0, 0);

    return vao;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    let color= [1.0, 0.0, 0.0, 1.0];

    shader.use();
    shader.setVec4("uColor", color);
    shader.setVec2("uTranslation", position); // 이동 값 전달

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    requestAnimationFrame(render);
}

async function main() {
    try {

        // WebGL 초기화
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }

        // 셰이더 초기화
        shader = await initShader();

        // setup text overlay (see util.js)
        textOverlay = setupText(canvas, "Use arrow keys to move the rectangle", 1);

        // 키보드 이벤트 설정
        setupKeyboardEvents();
        
        // 나머지 초기화
        vao = setupBuffers(shader);
        shader.use();
        
        // 렌더링 시작
        render();

        return true;

    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}

// 프로그램 시작

main().then(success => {
    if (!success) {
        console.log('프로그램을 종료합니다.');
        return;
    }
}).catch(error => {
    console.error('프로그램 실행 중 오류 발생:', error);
});
