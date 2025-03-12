// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element 
const gl = canvas.getContext('webgl2'); // Get the WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 현재 window 전체를 canvas로 사용
canvas.width = 500;
canvas.height = 500;

// Initialize WebGL settings: viewport and clear color

gl.enable(gl.SCISSOR_TEST);

function color4(x,y,r,g,b) {
    gl.viewport(x, y, canvas.width / 2, canvas.height / 2);
    gl.scissor(x, y, canvas.width / 2, canvas.height / 2);
    gl.clearColor(r, g, b, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

// Start rendering
render();

// Render loop
function render() {
    color4(canvas.width / 2, canvas.height / 2,0,1,0);
    color4(0, canvas.height / 2,1,0,0);
    color4(0,0,0,0,1);
    color4(canvas.width / 2, 0,1,1,0);
}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    if(window.innerHeight>=window.innerWidth) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth;
    }
    else {
        canvas.width = window.innerHeight;
        canvas.height = window.innerHeight;
    }
    
    render();
});

