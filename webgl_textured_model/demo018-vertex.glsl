    attribute vec3 aPosition;
    attribute vec2 aTexCoord;

    uniform mat4 mModel;
    uniform mat4 mView;
    uniform mat4 mProj;

    varying vec2 vTexCoord;

    void main() {
        gl_Position = mProj * mView * mModel * vec4(aPosition, 1.0);
        vTexCoord = aTexCoord;
    }