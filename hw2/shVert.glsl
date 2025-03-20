#version 300 es
precision mediump float;

layout (location = 0) in vec3 aPos;
uniform vec2 uTranslation;

void main() {
    gl_Position = vec4(aPos.xy + uTranslation, aPos.z, 1.0);
}
