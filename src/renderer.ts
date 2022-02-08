import {
  Camera,
  Context,
  DefaultFramebuffer,
  EventProvider,
  Invalidate,
  Navigation,
  Program,
  Renderer,
  Shader
} from "webgl-operate";

import { vec3, mat4 } from "webgl-operate";

import { LightsPass } from "./lights-pass";

import { GeometryPass } from "./geometrypass";

import { CuboidPass } from "./cuboid-pass";
import { SpherePass } from "./sphere-pass";
import { GLTFPass } from "./gltf-pass";

import { GeometryVertexShader, GeometryFragmentShader } from "./shaders";

export class TestRenderer extends Renderer {
  protected _startTime: number;
  protected _defaultFBO: DefaultFramebuffer;

  protected _navigation: Navigation;
  protected _camera: Camera;

  protected _lightsPass: LightsPass;
  protected _geometryPass: GeometryPass;
  protected _lightsBuffer: WebGLBuffer;

  protected _program: Program;
  protected _uViewProjection: WebGLUniformLocation;
  protected _uModel: WebGLUniformLocation;
  protected _uTime: WebGLUniformLocation;
  protected _uEye: WebGLUniformLocation;
  protected _uLights: WebGLUniformLocation;

  protected onInitialize(
    context: Context,
    callback: Invalidate,
    eventProvider: EventProvider
  ): boolean {
    this._startTime = Date.now();

    this._defaultFBO = new DefaultFramebuffer(context, "DefaultFBO");
    this._defaultFBO.initialize();

    /* Create and configure camera. */

    this._camera = new Camera();
    this._camera.center = vec3.fromValues(0.0, 0.0, 0.0);
    this._camera.up = vec3.fromValues(0.0, 1.0, 0.0);
    this._camera.eye = vec3.fromValues(0.0, 1.0, 4.0);
    this._camera.near = 0.01;
    this._camera.far = 32.0;

    /* Create and configure navigation */

    this._navigation = new Navigation(callback, eventProvider);
    this._navigation.camera = this._camera;

    /* */

    this._lightsPass = new LightsPass();
    this._lightsPass.initialize(context, this);

    this._geometryPass = new CuboidPass();
    // this._geometryPass = new SpherePass();
    this._geometryPass.initialize(context, this);

    /* */

    const gl = context.gl;

    this._lightsBuffer = gl.createBuffer();
    const lights = new Float32Array([
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
      40.0
    ]);

    gl.bindBuffer(gl.UNIFORM_BUFFER, this._lightsBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, lights, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    const vert = new Shader(context, gl.VERTEX_SHADER, "geometry.vert");
    vert.initialize(GeometryVertexShader);
    const frag = new Shader(context, gl.FRAGMENT_SHADER, "geometry.frag");
    frag.initialize(GeometryFragmentShader);

    this._program = new Program(context, "GeometryProgram");
    this._program.initialize([vert, frag], false);

    this._program.attribute("a_vertex", 0);
    this._program.attribute("a_texCoord", 1);
    this._program.link();
    this._program.bind();

    this._uViewProjection = this._program.uniform("u_viewProjection");
    this._uModel = this._program.uniform("u_model");
    this._uTime = this._program.uniform("u_time");
    this._uEye = this._program.uniform("u_eye");
    this._uLights = this._program.uniform("u_lights");
    const identity = mat4.identity(mat4.create());
    gl.uniformMatrix4fv(this._uModel, false, identity);

    return true;
  }

  protected onUninitialize(): void {}

  protected onDiscarded(): void {}

  protected onUpdate(): boolean {
    if (this._altered.frameSize) {
      this._camera.viewport = [this._frameSize[0], this._frameSize[1]];
    }
    if (this._altered.canvasSize) {
      this._camera.aspect = this._canvasSize[0] / this._canvasSize[1];
    }
    if (this._altered.clearColor) {
      this._defaultFBO.clearColor(this._clearColor);
    }
    this._navigation.update();

    this._lightsPass.update();
    this._geometryPass.update();

    return this._altered.any || this._camera.altered || true;
  }

  protected onPrepare(): void {
    this._altered.reset();
    this._camera.altered = false;
  }

  protected onFrame(frameNumber: number): void {
    const gl = this._context.gl;

    gl.viewport(0, 0, this._frameSize[0], this._frameSize[1]);

    this._defaultFBO.clear(
      gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
      true,
      false
    );

    // Draw Lights

    this._lightsPass.frame();

    // Draw Geometry (Cuboid, Sphere, or GLTF)

    this._program.bind();
    gl.uniformMatrix4fv(
      this._uViewProjection,
      false,
      this._camera.viewProjection
    );
    const timePassed = (Date.now() - this._startTime) / 1000.0;
    gl.uniform1f(this._uTime, timePassed);
    gl.uniform3fv(this._uEye, this._camera.eye);
    /*
    const lightsBlockIndex = gl.getUniformBlockIndex(
      this._program.object,
      "ub_lights"
    );
    gl.uniformBlockBinding(
      this._program.object,
      lightsBlockIndex,
      this._uLights
    );
    gl.bindBufferBase(gl.UNIFORM_BUFFER, lightsBlockIndex, this._lightsBuffer);
    */

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);

    this._geometryPass.draw();

    this._program.unbind();

    gl.cullFace(gl.BACK);
    gl.disable(gl.CULL_FACE);

    this.invalidate(true);
  }

  protected onSwap(): void {}
}
