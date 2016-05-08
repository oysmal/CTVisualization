varying vec3 worldSpaceCoords;
varying vec4 projectedCoords;

void main() {

  vec3 pos = position.xyz + vec3(0.5, 0.5, 0.5);
  worldSpaceCoords = (modelMatrix * vec4(pos, 1.0 )).xyz;

  gl_Position = projectionMatrix *  modelViewMatrix * vec4( position, 1.0 );

  projectedCoords =  projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
