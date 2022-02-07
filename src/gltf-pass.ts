import { Context } from "webgl-operate";
import { GeometryPass } from "./geometrypass";

export class GLTFPass implements GeometryPass {
  protected _context: Context;

  protected _loader: GLTFLoader;
  protected _forwardPass: ForwardSceneRenderPass;

  constructor(context: Context) {
    this._context = context;
  }

  public update(): void {}

  public draw(): void {}
}
