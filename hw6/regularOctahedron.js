/*-----------------------------------------------------------------------------
             
        v0
       /  \
      v4---\--v3
     /      \/
    v1------v2

-----------------------------------------------------------------------------*/

export class regularOctahedron {
    constructor(gl, options = {}) {
        this.gl = gl;
        
        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        let x=Math.sqrt(2);

        // Initializing data
        this.vertices = new Float32Array([
            // front face  (v0,v1,v2)
            0,x/2,0,  -0.5, 0,  0.5,   0.5, 0,0.5,
            // right face  (v0,v2,v3)
            0,x/2,0,   0.5,0,0.5,   0.5, 0, -0.5,
            // left face   (v0,v4,v1)
            0,x/2,0,  -0.5,0,-0.5,  -0.5, 0, 0.5,
            // back face   (v3,v4,v0)
            0.5, 0, -0.5,  -0.5, 0, -0.5,  0,x/2,0,
            
            // front face  (v0,v1,v2)
            0,-x/2,0,  -0.5, 0,  0.5,   0.5, 0,0.5,
            // right face  (v0,v2,v3)
            0,-x/2,0,   0.5,0,0.5,   0.5, 0, -0.5,
            // left face   (v0,v4,v1)
            0,-x/2,0,  -0.5,0,-0.5,  -0.5, 0, 0.5,
            // back face   (v3,v4,v0)
            0.5, 0, -0.5,  -0.5, 0, -0.5,  0,-x/2,0
        ]);

        let a=1/Math.sqrt(3);

        this.normals = new Float32Array([
            // front face 
            0, a, x*a,   0, a, x*a,   0, a, x*a,
            // right face 
            x*a, a, 0,   x*a, a, 0,   x*a, a, 0,
            // left face 
            -x*a, a, 0,  -x*a, a, 0,  -x*a, a, 0,
            // back face 
            0, a, -x*a,   0, a, -x*a,   0, a, -x*a,
            
            // front face 
            0, -a, x*a,   0, -a, x*a,   0, -a, x*a,
            // right face 
            x*a, -a, 0,   x*a, -a, 0,   x*a, -a, 0,
            // left face 
            -x*a, -a, 0,  -x*a, -a, 0,  -x*a, -a, 0,
            // back face 
            0, -a, -x*a,   0, -a, -x*a,   0, -a, -x*a
        ]);

        // if color is provided, set all vertices' color to the given color
        if (options.color) {
            for (let i = 0; i < 24 * 4; i += 4) {
                this.colors[i] = options.color[0];
                this.colors[i+1] = options.color[1];
                this.colors[i+2] = options.color[2];
                this.colors[i+3] = options.color[3];
            }
        }
        else {
            this.colors = new Float32Array([
                // front face  - red
                1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
                // right face  - yellow
                1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,
                // left face  - cyan
                0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,
                // back face - magenta
                1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,
                
                // front face  - red
                1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
                // right face  - yellow
                1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,
                // left face  - cyan
                0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,
                // back face - magenta
                1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,
            ]);
        }

        this.texCoords = new Float32Array([
            // front face  (v0,v1,v2)
            0.5,1,  0.25,0.5,    0.5,0.5,
            // right face  (v0,v2,v3)
            0.5,1,  0.5,0.5,   0.75,0.5,
            // left face   (v0,v4,v1)
            0.5,1,  0,0.5,    0.25,0.5,
            // back face   (v3,v4,v)
            0.75,0.5,    1,0.5,    0.5,1,
            
            // front face  (v5,v1,v2)
            0.5,0,  0.25,0.5,    0.5,0.5,
            // right face  (v5,v2,v3)
            0.5,0,  0.5,0.5,   0.75,0.5,
            // left face   (v5,v4,v1)
            0.5,0,  0,0.5,    0.25,0.5,
            // back face   (v3,v4,v5)
            0.75,0.5,    1,0.5,    0.5,0
        ]);

        this.indices = new Uint16Array([
            // front face
            0, 1, 2,    
            // right face
            3, 4, 5,   
            // left face
            6, 7, 8,  
            // back face
            9,10,11, 
            
            // front face
            12,13,14,  
            // right face
            15,16,17,   
            // left face
            18,19,20, 
            // back face
            21,22,23
        ]);

        this.sameVertices = new Uint16Array([
            0, 3, 6, 11,    // indices of the same vertices as v0
            1, 8, 13,20,// indices of the same vertices as v1
            2, 4,14,16, // indices of the same vertices as v2
            5,9,17, 21, // indices of the same vertices as v3
            7,10,19, 22, // indices of the same vertices as v4
            12,15,18,23 // indices of the same vertices as v5

        ]);

        this.vertexNormals = new Float32Array(72);
        this.faceNormals = new Float32Array(72);
        this.faceNormals.set(this.normals);

        // compute vertex normals 
        for (let i = 0; i < 24; i += 3) {

            let vn_x = (this.normals[this.sameVertices[i]*3] + 
                       this.normals[this.sameVertices[i+1]*3] + 
                       this.normals[this.sameVertices[i+2]*3]) / 3; 
            let vn_y = (this.normals[this.sameVertices[i]*3 + 1] + 
                       this.normals[this.sameVertices[i+1]*3 + 1] + 
                       this.normals[this.sameVertices[i+2]*3 + 1]) / 3; 
            let vn_z = (this.normals[this.sameVertices[i]*3 + 2] + 
                       this.normals[this.sameVertices[i+1]*3 + 2] + 
                       this.normals[this.sameVertices[i+2]*3 + 2]) / 3; 

            this.vertexNormals[this.sameVertices[i]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i+1]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i+2]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i+1]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i+2]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i]*3 + 2] = vn_z;
            this.vertexNormals[this.sameVertices[i+1]*3 + 2] = vn_z;
            this.vertexNormals[this.sameVertices[i+2]*3 + 2] = vn_z;
        }

        this.initBuffers();
    }

    copyVertexNormalsToNormals() {
        this.normals.set(this.vertexNormals);
    }

    copyFaceNormalsToNormals() {
        this.normals.set(this.faceNormals);
    }

    initBuffers() {
        const gl = this.gl;

        // 버퍼 크기 계산
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords.byteLength;
        const totalSize = vSize + nSize + cSize + tSize;

        gl.bindVertexArray(this.vao);

        // VBO에 데이터 복사
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);

        // EBO에 인덱스 데이터 복사
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // vertex attributes 설정
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  // position
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);  // normal
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);  // color
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize);  // texCoord

        // vertex attributes 활성화
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        // 버퍼 바인딩 해제
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);

    }

    updateNormals() {
        const gl = this.gl;
        const vSize = this.vertices.byteLength;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        
        // normals 데이터만 업데이트
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, 24, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
} 