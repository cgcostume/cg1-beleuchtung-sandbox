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


struct Light {
  vec3 position;
  vec3 color;
  float intensity;
};


const vec3 ambient = vec3(0.08, 0.08, 0.08);

uniform vec3 u_eye; // camera.eye in world space
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
  // return (floor(abs(N) + vec3(2.0)) - vec3(2.0)) * sign(N);
  // return (round(abs(N) - vec3(0.4999))) * sign(N);
  
  return floor(abs(N)) * sign(N);
  return normalize(position);
}

const float PI = 3.1415926535897932384626433832795;
const float DEG2RAD = PI / 180.0;

vec3 phong(in vec3 lightPosition, in vec4 lightColor, in vec3 position, in vec3 normal, in vec3 eye) {

  // all of the following light computations are done in World Space

  float anim_intensity = 1.0; //sin(u_time / 1.0) * 0.5 + 0.0;
  float attenuation = anim_intensity * pow(1.0 + length(position - lightPosition), -2.0);

  float intensity = 0.0;
  float specular = 0.0;
  float shininess = 32.0;

  vec3 N = normalize(normal); 
  vec3 L = normalize(lightPosition - position); // surface position to light
  vec3 E = normalize(eye - position); // surface position to camera.eye  
  vec3 R = reflect(-L, N);
  vec3 H = normalize(L + E);

  float NdotL = max(dot(N, L), 0.0); // lambert
  float EdotN = max(dot(E, N), 0.0);
  float EdotR = max(dot(E, R), 0.0);
  float NdotH = max(dot(N, H), 0.0);
  float LdotE = max(dot(L, E), 0.0);

  intensity = NdotL * attenuation;

  if(NdotL > 0.0) { // assume surface to be closed 

    // specular = pow(EdotR, shininess); // phong
    specular = max(0.0, pow(NdotH, shininess)); // blinn-phong
    
    // energy conservation (blinn-phong normalization http://www.farbrausch.de/~fg/stuff/phong.pdf)
    // specular *= (shininess + 2.0) * (shininess + 4.0);
    // specular *= 1.0 / (8.0 * PI * (pow(2.0, -0.5 * shininess) + shininess));

    // energy conservation based on akenine möller (third-edition)
    specular *= (shininess + 8.0) / (8.0 * PI);
    // intensity *= 1.0 / PI;

    // better use fresnel/schlick approximation?
    // F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
    float dielectric = 0.5;
    float dl_fix = pow(NdotL, 1.0/ 2.0);
    float fresnel = mix(dl_fix, pow(1.0 - EdotN, 5.0), dielectric);
    specular *= fresnel;
  } 
  vec3 result = (specular + intensity) * lightColor.rgb * lightColor.w;
  // result = pow(result, vec3(1.0 / 2.2));
  return result;

}


void main(void)
{
  vec3 N = computeNormalFromPosition(v_vertex.xyz);

  vec3 color = vec3(0.0);
  
  Light[] lights = Light[](
    Light(
      vec3(0.5, 1.3, 1.5),
      vec3(1.0, 0.9, 0.1),
      1.0
    ),
    Light(
      vec3(-2.2, 1.3, 0.4),
      vec3(0.0, 0.8, 1.0),
      1.0
    ),
    Light(
      vec3(0.5, 1.7, -0.5),
      vec3(0.0, 1.0, 0.1),
      1.0
    )
  );

  color += phong(lights[0].position, vec4(lights[0].color, lights[0].intensity), v_vertex.xyz, N, u_eye);
  color += phong(lights[1].position, vec4(lights[1].color, lights[1].intensity), v_vertex.xyz, N, u_eye);
  color += phong(lights[2].position, vec4(lights[2].color, lights[2].intensity), v_vertex.xyz, N, u_eye);

  fragColor = vec4(ambient + color, 1.0);
}`;
