import { Buffer, Context, Program, Renderer, Shader } from "webgl-operate";

import { mat4 } from "webgl-operate";

export class LightsPass {
  protected _context: Context;
  protected _renderer: Renderer;

  protected _particleVBO: Buffer;
  protected _instancesVBO: Buffer;

  protected readonly _uvLocation: GLuint = 0;
  protected readonly _positionLocation: GLuint = 1;

  protected _program: Program;

  protected _uViewProjection: WebGLUniformLocation;
  protected _uModel: WebGLUniformLocation;

  constructor() {}

  public initialize(context: Context, renderer: Renderer): void {
    this._context = context;
    this._renderer = renderer;

    context.enable(["ANGLE_instanced_arrays"]);

    const gl = context.gl;
    const gl2facade = context.gl2facade;

    const particle = new Float32Array([
      -1.0,
      -1.0,
      +1.0,
      -1.0,
      +1.0,
      +1.0,
      -1.0,
      +1.0
    ]);

    const floatSize: number = context.byteSizeOfFormat(gl.R32F);

    this._particleVBO = new Buffer(context, "particleVBO");
    this._particleVBO.initialize(gl.ARRAY_BUFFER);
    this._particleVBO.attribEnable(
      this._uvLocation,
      2,
      gl.FLOAT,
      false,
      2 * floatSize,
      0,
      true,
      false
    );
    gl2facade.vertexAttribDivisor(this._uvLocation, 0);
    this._particleVBO.data(particle, gl.STATIC_DRAW);

    this._instancesVBO = new Buffer(context, "instancesVBO");
    this._instancesVBO.initialize(gl.ARRAY_BUFFER);
    this._instancesVBO.attribEnable(
      this._positionLocation,
      3,
      gl.FLOAT,
      false,
      3 * floatSize,
      0,
      true,
      false
    );
    gl2facade.vertexAttribDivisor(this._positionLocation, 1);

    const data = new Float32Array([2.0, 2.0, 2.0]);
    this._instancesVBO.data(data, gl.STATIC_DRAW);

    const vert = new Shader(context, gl.VERTEX_SHADER, "light.vert");
    vert.initialize(`precision lowp float;
    precision lowp int;
    
    in vec2 a_uv;
    in vec3 a_position;
    
    uniform vec2 u_size; // [ point size in px, frame width in px ]

    uniform mat4 u_model;
    uniform mat4 u_viewProjection;
      
    out vec2 v_uv;
    out vec3 v_vertex;
    
    void main()
    {
      vec4 p  = u_model * vec4(a_position, 1.0);
      v_vertex = p.xyz / p.w;
    
      gl_Position = u_viewProjection * p;
      gl_PointSize = u_size[0] * 0.25 * u_size[1];
    
      // v_uv = a_uv;
    
      // vec3 uv = vec3(a_uv, 0.0);
      // vec3 u  = vec3(u_view[0][0], u_view[1][0], u_view[2][0]) * uv.x * u_size[0];
      // vec3 v  = vec3(u_view[0][1], u_view[1][1], u_view[2][1]) * uv.y * u_size[0];
    
      // gl_Position = u_viewProjection * vec4(p.xyz + u + v, 1.0);   
    }
    `);
    const frag = new Shader(context, gl.FRAGMENT_SHADER, "light.frag");
    frag.initialize(`precision lowp float;

    layout(location = 0) out vec4 fragColor; 
    
    in vec3 v_vertex;
    in vec2 v_uv;

    void main(void)
    {
      fragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
    `);

    this._program = new Program(context, "LightProgram");
    this._program.initialize([vert, frag], false);

    this._program.attribute("a_vertex", this._positionLocation);
    this._program.attribute("a_texCoord", this._uvLocation);
    this._program.link();
    this._program.bind();

    this._uViewProjection = this._program.uniform("u_viewProjection");
    this._uModel = this._program.uniform("u_model");
    const identity = mat4.identity(mat4.create());
    gl.uniformMatrix4fv(this._uModel, false, identity);
  }

  public update(): void {}

  public frame(): void {
    const gl = this._context.gl;
    const gl2facade = this._context.gl2facade;

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);

    gl.uniformMatrix4fv(
      this._uViewProjection,
      false,
      (this._renderer as any)._camera.viewProjection
    );
    const pointSize = 10.0;
    gl.uniform2f(
      this._program.uniform("u_size"),
      pointSize,
      (this._renderer as any)._frameSize[0]
    );

    this._particleVBO.bind();
    this._instancesVBO.bind();

    const instanceCount = 1; // this._drawRanges[this._drawIndex][1] / 3;
    this._instancesVBO.attribEnable(
      this._positionLocation,
      3,
      gl.FLOAT,
      false,
      3 * 4,
      0 * 4,
      true,
      false
    );

    gl2facade.drawArraysInstanced(gl.POINTS, 0, 1, instanceCount);

    this._program.bind();
  }
}
