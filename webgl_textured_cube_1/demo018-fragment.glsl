    precision mediump float;

    uniform sampler2D uTexture0;
    uniform sampler2D uTexture1;
    uniform float uMix;
    
    varying vec2 vTexCoord;
    
    void main() {
        vec4 t0 = texture2D(uTexture0, vTexCoord);
        vec4 t1 = texture2D(uTexture1, vTexCoord);
        gl_FragColor = mix(t0, t1, uMix);
    }