import { Context, CuboidGeometry, Renderer } from "webgl-operate";
import { GeometryPass } from "./geometrypass";

export class CuboidPass implements GeometryPass {
  protected _context: Context;

  protected _cuboid: CuboidGeometry;

  constructor() {}

  public initialize(context: Context, renderer: Renderer): void {
    this._context = context;
    this._cuboid = new CuboidGeometry(this._context, "Cuboid", true, [
      2.0,
      2.0,
      2.0
    ]);
    this._cuboid.initialize();
  }

  public update(): void {}

  public draw(): void {
    this._cuboid.bind();
    this._cuboid.draw();
    this._cuboid.unbind();
  }
}
