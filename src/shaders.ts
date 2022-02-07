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

void main(void)
{
  // fragColor = vec4(v_vertex.xyz * 0.5 + 0.5, 1.0);
  vec3 normal = v_vertex.xyz;
  // vec3 normal = normalize(v_normal);

  vec3 N = normal;
  // if(abs(n.y) < abs(n.z) && abs(n.x) < abs(n.z)) {
  //   normal = vec3(0.0, 0.0, sign(n.z));
  // }
  // else if(abs(n.x) < abs(n.y) && abs(n.z) < abs(n.y)) {
  //   normal = vec3(0.0, sign(n.y), 0.0);
  // }
  // else if(abs(n.y) < abs(n.x) && abs(n.z) < abs(n.x)) {
  //   normal = vec3(sign(n.x), 0.0, 0.0);
  // }
  N = floor(abs(N)) * sign(N); // same as above ;)


  vec3 L0 = normalize(light0Position - v_vertex.xyz);
  float i0 = clamp(dot(L0, N), 0.0, 1.0); // [-1,+1]
  vec3 L1 = normalize(light1Position - v_vertex.xyz);
  float i1 = clamp(dot(L1, N), 0.0, 1.0); // [-1,+1]

  // float attenuation = pow(length(v_vertex.xyz - light0Position), -2.0);
  float attenuation0 = 1.0 / length(v_vertex.xyz - light0Position);
  float attenuation1 = 1.0 / length(v_vertex.xyz - light1Position);
  attenuation0 *= light0Intensity;
  attenuation1 *= light1Intensity;

  // fragColor = vec4(N * 0.5 + 0.5, 1.0);
  // fragColor = vec4(vec3(i), 1.0);
  // fragColor = vec4(vec3(attenuation * i), 1.0);
  
  fragColor = vec4(
    mix(ambient, light0Color, attenuation0 * i0) +
    mix(ambient, light1Color, attenuation1 * i1)
    , 1.0);
}
`;
