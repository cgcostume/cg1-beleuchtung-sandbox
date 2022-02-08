import { Buffer, Context, Program, Renderer, Shader } from "webgl-operate";

import { mat4 } from "webgl-operate";

export class LightsPass {
  protected _context: Context;
  protected _renderer: Renderer;

  protected _points: Float32Array;
  protected _pointsBuffer: Buffer;

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

    this._points = new Float32Array([
      // x, y, z, r, g, b, data,
      0.5,
      1.3,
      1.5,
      1.0,
      0.9,
      0.1,
      40.0,
      -2.2,
      1.3,
      0.4,
      0.0,
      0.8,
      1.0,
      40.0,
      0.5,
      1.7,
      -0.5,
      0.0,
      1.0,
      0.1,
      40.0
    ]);

    this._pointsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._pointsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._points, gl.STATIC_DRAW);

    const vert = new Shader(context, gl.VERTEX_SHADER, "light.vert");
    vert.initialize(`precision lowp float;

    layout(location = 0) in vec3 a_vertex;
    layout(location = 1) in vec3 a_color;
    layout(location = 2) in float a_data;

  uniform mat4 u_viewProjection;

  out vec4 v_color;

  void main()
  {
      v_color = vec4(a_color, 1.0);

      gl_Position = u_viewProjection * vec4(a_vertex, 1.0);
      gl_PointSize = a_data;
  }
  `);
    const frag = new Shader(context, gl.FRAGMENT_SHADER, "light.frag");
    frag.initialize(`precision lowp float;

    layout(location = 0) out vec4 fragColor;

    in vec4 v_color;

    void main(void)
    {
      vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;

      float zz = dot(uv, uv);
      if(zz > 1.0)
            discard;

        fragColor = v_color;
    }
    `);

    this._program = new Program(context, "LightProgram");
    this._program.initialize([vert, frag], false);

    this._program.link();
    this._program.bind();

    this._program.attribute("a_vertex", 0);
    this._program.attribute("a_color", 1);
    this._program.attribute("a_data", 2);

    this._uViewProjection = this._program.uniform("u_viewProjection");
    this._uModel = this._program.uniform("u_model");
    const identity = mat4.identity(mat4.create());
    gl.uniformMatrix4fv(this._uModel, false, identity);
  }

  public update(): void {}

  public frame(): void {
    const gl = this._context.gl;
    const gl2facade = this._context.gl2facade;

    gl.enable(gl.DEPTH_TEST);

    this._program.bind();
    gl.uniformMatrix4fv(
      this._uViewProjection,
      false,
      (this._renderer as any)._camera.viewProjection
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this._pointsBuffer);

    gl.vertexAttribPointer(
      0,
      3,
      gl.FLOAT,
      gl.FALSE,
      7 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.vertexAttribPointer(
      1,
      3,
      gl.FLOAT,
      gl.FALSE,
      7 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.vertexAttribPointer(
      2,
      1,
      gl.FLOAT,
      gl.FALSE,
      7 * Float32Array.BYTES_PER_ELEMENT,
      6 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    gl.drawArrays(gl.POINTS, 0, this._points.length / 7);
    gl.bindBuffer(gl.ARRAY_BUFFER, Buffer.DEFAULT_BUFFER);

    gl.disableVertexAttribArray(0);
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);

    this._program.unbind();
  }
}
