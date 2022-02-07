import {
  Context,
  // GLTFLoader,
  // ForwardSceneRenderPass,
  Renderer
} from "webgl-operate";

// import { mat4 } from "webgl-operate";

import { GeometryPass } from "./geometrypass";

export class GLTFPass implements GeometryPass {
  protected _context: Context;

  // protected _loader: GLTFLoader;
  // protected _forwardPass: ForwardSceneRenderPass;

  constructor() {}

  public initialize(context: Context, renderer: Renderer): void {
    // this._context = context;
    // this._loader = new GLTFLoader(this._context);
    // const uri = "/matrix-chair.glb";
    // this._forwardPass.scene = undefined;
    // this._forwardPass = new ForwardSceneRenderPass(this._context);
    // this._forwardPass.initialize();
    // const anyRenderer = renderer as any; // ugly, do not do this...
    // this._forwardPass.camera = anyRenderer._camera;
    // this._forwardPass.target = anyRenderer._defaultFBO;
    // const gl = context.gl;
    // this._forwardPass.program = anyRenderer._program;
    // this._forwardPass.updateModelTransform = (matrix: mat4) => {
    //   gl.uniformMatrix4fv(anyRenderer._uModel, false, matrix);
    // };
    // this._forwardPass.updateViewProjectionTransform = (matrix: mat4) => {
    //   gl.uniformMatrix4fv(anyRenderer._uViewProjection, false, matrix);
    // };
    // this._forwardPass.bindUniforms = () => {
    //   gl.uniform3fv(this._uEye, this._camera.eye);
    //   gl.uniform1i(this._uNormal, 2);
    // };
    // this._forwardPass.bindGeometry = (geometry: Geometry) => {};
    // this._forwardPass.bindMaterial = (material: Material) => {
    //   const pbrMaterial = material as GLTFPbrMaterial;
    //   auxiliaries.assert(
    //     pbrMaterial !== undefined,
    //     `Material ${material.name} is not a PBR material.`
    //   );
    //   pbrMaterial.normalTexture!.bind(gl.TEXTURE2);
    // };
    // this._loader.uninitialize();
    // this._loader.loadAsset(uri).then(() => {
    //   this._forwardPass.scene = this._loader.defaultScene;
    //   console.log("gltf loaded");
    // });
  }

  public update(): void {}

  public draw(): void {
    // this._forwardPass.frame();
  }
}
