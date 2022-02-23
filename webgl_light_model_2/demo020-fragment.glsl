precision mediump float;

uniform sampler2D uTexture0;
uniform vec3 ambientLight;
uniform vec3 diffuseLightColor;
uniform vec3 diffuseLightDirection;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
    // Debug values
    //vec4 ambientLight = vec4(0.2, 0.2, 0.5, 1.0);
    //vec4 diffuseLightColor = vec4(0.9, 0.7, 0.4, 1.0);
    //vec4 diffuseLightDirection = normalize(vec4(-1.0, 0.0, 0.0, 1.0));

    vec3 normal = normalize(vNormal);
    vec4 texel = texture2D(uTexture0, vTexCoord);

    // Debug normals
    //gl_FragColor = normal; 

    // Debug lights
    //gl_FragColor = ambientLight + diffuseLightColor * max(dot(diffuseLightDirection, normal), 0.0);

    // Debug texel
    //gl_FragColor = texel;

    //gl_FragColor = texel * ambientLight + texel * diffuseLightColor * max(dot(normalize(diffuseLightDirection), normal), 0.0);

    // TODO: make an uniform
    vec3 eye = vec3(0.0, 0.0, 1.0);
    vec3 specularLightColor = vec3(1.0, 1.0, 1.0);
    float p = dot(normal.xyz, diffuseLightDirection);
    vec3 reflection;
    if (p > 0.0) {
        reflection = normalize(2.0 * p * normal.xyz - diffuseLightDirection);
    } else {
        reflection = vec3(0.0, 0.0, 0.0);
    }
    gl_FragColor = vec4(
        texel.rgb * ambientLight
        +
        texel.rgb * diffuseLightColor * max(dot(diffuseLightDirection, normal), 0.0)
        +
        texel.rgb * specularLightColor * max(pow(dot(reflection, eye), 3.0), 0.0)
        , 
        texel.a);

}
