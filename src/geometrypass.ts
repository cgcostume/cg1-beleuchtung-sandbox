export interface GeometryPass {
  initialize(): void;
  update(): void;
  draw(): void;
}
