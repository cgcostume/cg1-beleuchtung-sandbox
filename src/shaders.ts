export const GeometryVertexShader: string = `precision lowp float;

layout(location = 0) in vec3 a_vertex;
layout(location = 1) in vec2 a_texCoord;

uniform mat4 u_viewProjection;
uniform mat4 u_model;

out vec4 v_vertex;
out vec2 v_uv;
out vec3 v_normal;

void main()
{
    v_vertex = u_model * vec4(a_vertex, 1.0);
    v_uv = a_texCoord;
    v_normal = normalize(a_vertex);

    gl_Position = u_viewProjection *  v_vertex;
}
`;

export const GeometryFragmentShader: string = `precision lowp float;

layout(location = 0) out vec4 fragColor;

in vec4 v_vertex;
in vec3 v_normal;
in vec2 v_uv;

// TODO: refactor into arrays
const vec3  light0Position = vec3(0.5, 1.3, 1.5);
const vec3  light0Color = vec3(1.0, 0.9, 0.1);
const float light0Intensity = 1.0;
// -2.2, 1.3, 0.4, 0.0, 0.8, 1.0,
const vec3  light1Position = vec3(-2.2, 1.3, 0.4);
const vec3  light1Color = vec3(0.0, 0.8, 1.0);
const float light1Intensity = 1.0;


const vec3 ambient = vec3(0.05, 0.06, 0.07);

uniform vec3 u_eye;
uniform float u_time;

vec3 computeNormalFromPosition(in vec3 position) {

  vec3 N = position;
  // if(abs(N.y) < abs(N.z) && abs(N.x) < abs(N.z)) {
  //   N = vec3(0.0, 0.0, sign(N.z));
  // }
  // else if(abs(N.x) < abs(N.y) && abs(N.z) < abs(N.y)) {
  //   N = vec3(0.0, sign(N.y), 0.0);
  // }
  // else if(abs(N.y) < abs(N.x) && abs(N.z) < abs(N.x)) {
  //   N = vec3(sign(N.x), 0.0, 0.0);
  // }

  /* NVIDIA QUADRO WORKAROUNDS (WS: Pleasers) */
  return (floor(abs(N) + vec3(2.0)) - vec3(2.0)) * sign(N);
  // return (round(abs(N) - vec3(0.4999))) * sign(N);
  
  return floor(abs(N)) * sign(N);
}

const float PI = 3.1415926535897932384626433832795;
const float DEG2RAD = PI / 180.0;

vec3 phong(in vec3 lightPosition, in vec4 lightColor, in vec3 position, in vec3 normal, in vec3 eye) {

  float attenuation = 10.0 * pow(length(position - lightPosition), -2.0);
  float intensity = 0.0;
  float specular = 0.0;

  vec3 N = normalize(normal); 
  vec3 L = normalize(lightPosition - position); // surface position to light
  vec3 E = normalize(eye - position); // surface position to camera eye
  vec3 R = reflect(-L, N);
  vec3 H = normalize(L + E);

  // vec3 lightDirection = normalize(vec3(0.0, 0.0, -1.0));
  // float cutoff = 0.6;//10.0 * DEG2RAD;
  
  // if(dot(L, -lightDirection) >= cutoff) {

    float NdotL = max(dot(N, L), 0.0); // lambert
    float EdotR = max(dot(R, E), 0.0);
    float NdotH = max(dot(N, H), 0.0);

    intensity = NdotL; // * attenuation;
    // specular = clamp(pow(EdotR, 16.0), 0.0, 1.0);
    specular = clamp(pow(NdotH, 16.0), 0.0, 1.0);
  // }

  return  vec3(intensity + specular); // * lightColor.rgb;
}

void main(void)
{
  vec3 N = computeNormalFromPosition(v_vertex.xyz);

  vec3 color = vec3(0.0);
  color += phong(light0Position, vec4(light0Color, light0Intensity), v_vertex.xyz, N, u_eye);
  // color += phong(light1Position, vec4(light1Color, light1Intensity), v_vertex.xyz, N, u_eye);

  fragColor = vec4(color, 1.0);
}
`;
