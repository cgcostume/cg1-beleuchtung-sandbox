import { Context } from "webgl-operate";

export class LightsPass {
  protected _context: Context;

  constructor(context: Context) {
    this._context = context;
  }

  public initialize(): void {}

  public update(): void {}

  public frame(): void {}
}
