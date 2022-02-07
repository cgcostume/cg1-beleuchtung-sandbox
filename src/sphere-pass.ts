import { Context } from "webgl-operate";
import { GeometryPass } from "./geometrypass";

export class SpherePass implements GeometryPass {
  protected _context: Context;

  constructor(context: Context) {
    this._context = context;
  }

  public update(): void {}

  public draw(): void {}
}
