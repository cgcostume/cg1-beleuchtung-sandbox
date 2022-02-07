import { Context, GeosphereGeometry, Renderer } from "webgl-operate";
import { GeometryPass } from "./geometrypass";

export class SpherePass implements GeometryPass {
  protected _context: Context;
  protected _sphere: GeosphereGeometry;

  constructor() {}
  public initialize(context: Context, renderer: Renderer): void {
    this._context = context;

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
