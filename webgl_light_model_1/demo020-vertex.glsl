attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;

uniform mat4 mModel;
uniform mat4 mView;
uniform mat4 mProj;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
    gl_Position = mProj * mView * mModel * vec4(aPosition, 1.0);
    vTexCoord = aTexCoord;

    // Debug normals
    //vNormal = aNormal;

    // Orient normals to world coordinates
    vNormal = (mModel * vec4(aNormal, 0.0)).xyz;
}