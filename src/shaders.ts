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

/* Refactored into lights array in main
const vec3  light0Position = vec3(0.5, 1.3, 1.5);
const vec3  light0Color = vec3(1.0, 0.9, 0.1);
const float light0Intensity = 1.0;
// -2.2, 1.3, 0.4, 0.0, 0.8, 1.0,
const vec3  light1Position = vec3(-2.2, 1.3, 0.4);
const vec3  light1Color = vec3(0.0, 0.8, 1.0);
const float light1Intensity = 1.0;
*/

const vec3 ambient = vec3(0.05, 0.06, 0.07);

uniform vec3 u_eye; // camera.eye in world space
uniform float u_time;

// from https://stackoverflow.com/a/17897228
// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
// All components are in the range [0…1], including hue.
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// from https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}
float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}



void node_bump(float strength,
               float dist,
               float height,
               float height_dx,
               float height_dy,
               vec3 N,
               vec3 surf_pos,
               float invert,
               out vec3 result)
{
  N = normalize(N);
  dist *= gl_FrontFacing ? invert : -invert;

  vec3 dPdx = dFdx(surf_pos);
  vec3 dPdy = dFdy(surf_pos);

  vec3 Rx = cross(dPdy, N);
  vec3 Ry = cross(N, dPdx);

  float det = dot(dPdx, Rx);

  float dHdx = height_dx - height;
  float dHdy = height_dy - height;
  vec3 surfgrad = dHdx * Rx + dHdy * Ry;

  strength = max(strength, 0.0);

  result = normalize(abs(det) * N - dist * sign(det) * surfgrad);
  result = normalize(mix(N, result, strength));

}


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
  N = normalize(N);
  float height = noise(80.0 * position);
  if (gl_FragCoord.x > 650.0) {
    node_bump(1.0, 1.0, height, dFdx(height), dFdy(height), N, position, 1.0, N);
  }
  return N;
  /* NVIDIA QUADRO WORKAROUNDS (WS: Pleasers) */
   return (floor(abs(N) + vec3(2.0)) - vec3(2.0)) * sign(N);
  // return (round(abs(N) - vec3(0.4999))) * sign(N);
  
  //return floor(abs(N)) * sign(N);
}

const float PI = 3.1415926535897932384626433832795;
const float DEG2RAD = PI / 180.0;

vec3 phong(in vec3 lightPosition, in vec4 lightColor, in vec3 position, in vec3 normal, in vec3 eye) {

  // all of the following light computations are done in World Space

  float anim_intensity = 1.0; //sin(u_time / 5.0) * 0.5 + 0.5;
  float attenuation = anim_intensity * pow(length(position - lightPosition), -2.0);
  float intensity = 0.0;
  float specular = 0.0;

  vec3 N = normalize(normal); 
  vec3 L = normalize(lightPosition - position); // surface position to light
  vec3 E = normalize(eye - position); // surface position to camera.eye  
  vec3 R = reflect(-L, N);
  vec3 H = normalize(L + E);

  float NdotL = max(dot(N, L), 0.0); // lambert
  float EdotR = max(dot(E, R), 0.0);
  float NdotH = max(dot(N, H), 0.0);

  intensity = NdotL * attenuation;
  specular = pow(EdotR, 20.4); // phong
  specular = pow(NdotH, 20.4); // blinn-phong


  vec3 color = lightColor.rgb;
  color = rgb2hsv(color);
  color = hsv2rgb(color + vec3(
      mod(u_time / 5.0, 1.0),
      0.0,
      0.0
  ));
  return (specular + intensity) * color * lightColor.w;
  // return vec3(H * 0.5 + 0.5 ) * 0.333; //intensity * color;
}

//  L_i * K_

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
      0.5
    )
  );

  for (int i = 0; i < lights.length(); i++) {
    Light light = lights[i];
    color += phong(
      light.position,
      vec4(light.color, light.intensity),
      v_vertex.xyz,
      N,
      u_eye
    );
  }
  
  /*
  color += phong(light0Position, vec4(light0Color, light0Intensity), v_vertex.xyz, N, u_eye);
  color += phong(light1Position, vec4(light1Color, light1Intensity), v_vertex.xyz, N, u_eye);
  */
  fragColor = vec4(ambient + color, 1.0);
}
`;
