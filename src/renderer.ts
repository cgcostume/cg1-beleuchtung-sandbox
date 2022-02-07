import {
  Camera,
  Context,
  DefaultFramebuffer,
  EventProvider,
  Invalidate,
  Navigation,
  Renderer
} from "webgl-operate";

import { vec3 } from "webgl-operate";

import { LightsPass } from "./lights-pass";

import { GeometryPass } from "./geometrypass";

import { CuboidPass } from "./cuboid-pass";
// import { SpherePass } from "./sphere-pass";
// import { GLTFPass } from "./gltf-pass";

export class TestRenderer extends Renderer {
  protected _defaultFBO: DefaultFramebuffer;

  protected _navigation: Navigation;
  protected _camera: Camera;

  protected _lightsPass: LightsPass;
  protected _geometryPass: GeometryPass;

  protected onInitialize(
    context: Context,
    callback: Invalidate,
    eventProvider: EventProvider
  ): boolean {
    this._defaultFBO = new DefaultFramebuffer(context, "DefaultFBO");
    this._defaultFBO.initialize();

    /* Create and configure camera. */

    this._camera = new Camera();
    this._camera.center = vec3.fromValues(0.0, 0.0, 0.0);
    this._camera.up = vec3.fromValues(0.0, 1.0, 0.0);
    this._camera.eye = vec3.fromValues(0.0, 1.0, 2.0);
    this._camera.near = 0.5;
    this._camera.far = 4.0;

    /* Create and configure navigation */

    this._navigation = new Navigation(callback, eventProvider);
    this._navigation.camera = this._camera;

    /* */

    this._lightsPass = new LightsPass(context);
    this._lightsPass.initialize();

    this._geometryPass = new CuboidPass(context);
    this._geometryPass.initialize();

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
      console.log(this._clearColor);
      this._defaultFBO.clearColor(this._clearColor);
    }
    this._navigation.update();

    // this._lightsPass.update();
    // this._geometryPass.update();

    return this._altered.any || this._camera.altered;
  }

  protected onPrepare(): void {
    this._altered.reset();
    this._camera.altered = false;
  }

  protected onFrame(frameNumber: number): void {
    const gl = this._context.gl;

    gl.viewport(0, 0, this._frameSize[0], this._frameSize[1]);

    console.log("fo", this._frameSize);
    this._defaultFBO.clear(
      gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
      true,
      false
    );

    // this._lightsPass.frame();
    // this._geometryPass.draw();
  }

  protected onSwap(): void {}
}
