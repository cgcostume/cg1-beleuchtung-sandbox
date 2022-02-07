import { Context, GeosphereGeometry } from "webgl-operate";
import { GeometryPass } from "./geometrypass";

export class SpherePass implements GeometryPass {
  protected _context: Context;
  protected _sphere: GeosphereGeometry;

  constructor(context: Context) {
    this._context = context;
  }
  public initialize(): void {
    this._sphere = new GeosphereGeometry(this._context, "Sphere");
    this._sphere.initialize();
  }

  public update(): void {}

  public draw(): void {
    this._sphere.bind();
    this._sphere.draw();
    this._sphere.unbind();
  }
}
