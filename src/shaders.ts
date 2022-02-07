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
in vec2 v_uv;

void main(void)
{
  fragColor = vec4(v_vertex.xyz * 0.5 + 0.5, 1.0);
}
`;
