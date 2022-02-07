import { Context, Renderer } from "webgl-operate";

export interface GeometryPass {
  initialize(context: Context, renderer: Renderer): void;
  update(): void;
  draw(): void;
}
