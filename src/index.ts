import "./styles.css";

import { Canvas, Color, version, Wizard } from "webgl-operate";

import { TestRenderer } from "./renderer";

export const initialize = () => {
  document.getElementById(
    "gloperate-version"
  )!.innerHTML = `webgl-operate version: ${version}`;
  console.log(`webgl-operate loaded: ${version}`);

  const canvas = new Canvas("canvas", { antialias: false });
  canvas.controller.multiFrameNumber = 1;
  canvas.framePrecision = Wizard.Precision.byte;
  canvas.frameScale = [1.0, 1.0];
  canvas.clearColor = new Color([0.001, 0.001, 0.001, 1.0]);

  const renderer = new TestRenderer();
  canvas.renderer = renderer;

  (window as any)["canvas"] = canvas;
  (window as any)["context"] = canvas.context;
  (window as any)["controller"] = canvas.controller;

  (window as any)["renderer"] = renderer;
};

initialize();
