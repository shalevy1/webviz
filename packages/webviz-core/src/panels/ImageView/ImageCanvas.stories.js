// @flow
//
//  Copyright (c) 2018-present, GM Cruise LLC
//
//  This source code is licensed under the Apache License, Version 2.0,
//  found in the LICENSE file in the root directory of this source tree.
//  You may not use this file except in compliance with the License.

import { storiesOf } from "@storybook/react";
import { range, noop } from "lodash";
import * as React from "react";
import { withScreenshot } from "storybook-chrome-screenshot";

import { getGlobalHooks } from "webviz-core/src/loadWebviz";
import CameraModel from "webviz-core/src/panels/ImageView/CameraModel";
import ImageCanvas from "webviz-core/src/panels/ImageView/ImageCanvas";

const cameraInfo = {
  width: 400,
  height: 300,
  distortion_model: "plumb_bob",
  D: [-0.437793, 0.183639, -0.003738, -0.001327, 0],
  K: [2339.067676, 0, 903.297282, 0, 2323.624869, 566.425547, 0, 0, 1],
  R: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  P: [2170.145996, 0, 899.453592, 0, 0, 2275.496338, 568.217702, 0, 0, 0, 1, 0],
  binning_x: 1,
  binning_y: 1,
  roi: {
    x_offset: 0,
    y_offset: 0,
    height: 0,
    width: 0,
    do_rectify: false,
  },
};

const imageData = (() => {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 400, 300);
  gradient.addColorStop(0, "cyan");
  gradient.addColorStop(1, "green");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 300);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "red";
  ctx.strokeRect(0, 0, 400, 300);
  return canvas.toDataURL().replace(/^data:image\/png;base64,/, "");
})();

function marker(type: number, props: {}) {
  return {
    op: "message",
    topic: "/foo",
    receiveTime: { sec: 0, nsec: 0 },
    datatype: "visualization_msgs/ImageMarker",
    message: { ...props, type },
  };
}

const imageMessage = {
  op: "message",
  datatype: "dummy",
  topic: "/foo",
  receiveTime: { sec: 0, nsec: 0 },
  message: { data: imageData },
};

function makeLines(xOffset: number) {
  return [
    { x: xOffset + 30, y: 50 },
    { x: xOffset + 32, y: 58 },
    { x: xOffset + 45, y: 47 },
    { x: xOffset + 60, y: 50 },
    { x: xOffset + 65, y: 40 },
    { x: xOffset + 40, y: 45 },
  ];
}

const markers = [
  // circles
  marker(0, {
    position: { x: 40, y: 20 },
    scale: 5,
    thickness: 2,
    outline_color: { r: 255, g: 127, b: 0 },
  }),
  marker(0, {
    position: { x: 55, y: 20 },
    scale: 5,
    thickness: -1,
    outline_color: { r: 255, g: 0, b: 255 },
  }),
  marker(1, {
    thickness: 1,
    points: [{ x: 40, y: 20 }, { x: 40, y: 30 }, { x: 30, y: 30 }],
    outline_color: { r: 0, g: 0, b: 255 },
  }),
  // line strip
  marker(1, {
    thickness: 2,
    points: makeLines(0),
    outline_color: { r: 255, g: 255, b: 255 },
  }),
  // line list
  marker(2, {
    thickness: 2,
    points: makeLines(50),
    outline_color: { r: 127, g: 127, b: 255 },
  }),
  // polygon
  marker(3, {
    thickness: 2,
    points: makeLines(100),
    outline_color: { r: 127, g: 127, b: 255 },
  }),
  marker(3, {
    thickness: -10,
    points: makeLines(150),
    outline_color: { r: 127, g: 255, b: 127 },
  }),
  marker(3, {
    thickness: -10,
    points: [{ x: 100, y: 20 }, { x: 120, y: 20 }, { x: 120, y: 30 }, { x: 100, y: 30 }],
    outline_color: { r: 127, g: 255, b: 127 },
  }),
  marker(3, {
    thickness: 1,
    points: [{ x: 100, y: 20 }, { x: 120, y: 20 }, { x: 120, y: 30 }, { x: 100, y: 30 }],
    outline_color: { r: 0, g: 0, b: 0 },
  }),
  marker(3, {
    thickness: -10,
    points: [{ x: 150, y: 20 }, { x: 170, y: 20 }, { x: 170, y: 30 }, { x: 150, y: 30 }],
    outline_color: { r: 127, g: 255, b: 127 },
  }),
  // points
  marker(4, {
    points: range(50).map((i) => ({ x: 20 + 5 * i, y: 130 + 10 * Math.sin(i / 2) })),
    fill_color: { r: 255, g: 0, b: 0 },
  }),
  marker(4, {
    scale: 1,
    points: range(50).map((i) => ({ x: 20 + 5 * i, y: 150 + 10 * Math.sin(i / 2) })),
    fill_color: { r: 127, g: 255, b: 0 },
  }),
  marker(4, {
    scale: 2,
    points: range(50).map((i) => ({ x: 20 + 5 * i, y: 170 + 10 * Math.sin(i / 2) })),
    fill_color: { r: 0, g: 0, b: 255 },
  }),
  marker(4, {
    scale: 2,
    points: range(50).map((i) => ({ x: 20 + 5 * i, y: 190 + 10 * Math.sin(i / 2) })),
    outline_colors: range(50).map((i) => ({
      r: Math.round(255 * Math.min(1, (2 * i) / 50)),
      g: Math.round(255 * Math.min(1, (2 * (i - 15)) / 50)),
      b: Math.round(255 * Math.min(1, (2 * (i - 30)) / 50)),
    })),
    fill_color: { r: 0, g: 0, b: 255 },
  }),
  // text
  marker(5, {
    text: { data: "Hello!" },
    position: { x: 30, y: 100 },
    scale: 1,
    outline_color: { r: 255, g: 127, b: 127 },
  }),
  marker(5, {
    text: { data: "Hello!" },
    position: { x: 130, y: 100 },
    scale: 1,
    outline_color: { r: 255, g: 127, b: 127 },
    filled: true,
    fill_color: { r: 50, g: 50, b: 50 },
  }),
  marker(0, {
    position: { x: 30, y: 100 },
    scale: 2,
    thickness: -1,
    outline_color: { r: 255, g: 255, b: 0 },
  }),
  marker(0, {
    position: { x: 130, y: 100 },
    scale: 2,
    thickness: -1,
    outline_color: { r: 255, g: 255, b: 0 },
  }),
];

const topics = ["/camera_front_medium/image_rect_color_compressed", "/storybook_image"];
const config = getGlobalHooks().perPanelHooks().ImageView.defaultConfig;

function RGBStory({ encoding }: { encoding: string }) {
  const width = 2560;
  const height = 2000;
  const data = new Uint8Array(3 * height * width);
  let idx = 0;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const r = Math.max(0, 1 - Math.hypot(1 - row / height, col / width)) * 256;
      const g = Math.max(0, 1 - Math.hypot(row / height, 1 - col / width)) * 256;
      const b = Math.max(0, 1 - Math.hypot(1 - row / height, 1 - col / width)) * 256;
      data[idx++] = encoding === "bgr8" ? b : r;
      data[idx++] = g;
      data[idx++] = encoding === "bgr8" ? r : b;
    }
  }
  return (
    <ImageCanvas
      topic={topics[0]}
      image={{
        op: "message",
        datatype: "sensor_msgs/Image",
        topic: "/foo",
        receiveTime: { sec: 0, nsec: 0 },
        message: { data, width, height, encoding },
      }}
      markerData={null}
      config={config}
      saveConfig={noop}
    />
  );
}

function BayerStory({ encoding }: { encoding: string }) {
  const width = 2560;
  const height = 2000;
  const data = new Uint8Array(height * width);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const r = Math.max(0, 1 - Math.hypot(1 - row / height, col / width)) * 256;
      const g = Math.max(0, 1 - Math.hypot(row / height, 1 - col / width)) * 256;
      const b = Math.max(0, 1 - Math.hypot(1 - row / height, 1 - col / width)) * 256;
      switch (encoding) {
        case "bayer_rggb8":
          data[row * width + col] = row % 2 === 0 ? (col % 2 === 0 ? r : g) : col % 2 === 0 ? g : b;
          break;
        case "bayer_bggr8":
          data[row * width + col] = row % 2 === 0 ? (col % 2 === 0 ? b : g) : col % 2 === 0 ? g : r;
          break;
        case "bayer_gbrg8":
          data[row * width + col] = row % 2 === 0 ? (col % 2 === 0 ? g : b) : col % 2 === 0 ? r : g;
          break;
        case "bayer_grbg8":
          data[row * width + col] = row % 2 === 0 ? (col % 2 === 0 ? g : r) : col % 2 === 0 ? b : g;
          break;
      }
    }
  }
  return (
    <ImageCanvas
      topic={topics[0]}
      image={{
        op: "message",
        datatype: "sensor_msgs/Image",
        topic: "/foo",
        receiveTime: { sec: 0, nsec: 0 },
        message: { data, width, height, encoding },
      }}
      markerData={null}
      config={config}
      saveConfig={noop}
    />
  );
}

function Mono16Story({ bigEndian }: { bigEndian: boolean }) {
  const width = 2000;
  const height = 1000;
  const data = new Uint8Array(width * height * 2);
  const view = new DataView(data.buffer);
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const val = Math.round(Math.min(1, Math.hypot(c / width, r / height)) * 10000);
      view.setUint16(2 * (r * width + c), val, true);
    }
  }
  return (
    <ImageCanvas
      topic={topics[0]}
      image={{
        op: "message",
        datatype: "sensor_msgs/Image",
        topic: "/foo",
        receiveTime: { sec: 0, nsec: 0 },
        message: { data, width, height, encoding: "16UC1", is_bigendian: 0 },
      }}
      markerData={null}
      config={config}
      saveConfig={noop}
    />
  );
}

storiesOf("<ImageCanvas>", module)
  .addDecorator(withScreenshot())
  .add("markers", () => (
    <div>
      <h2>original markers</h2>
      <ImageCanvas
        topic={topics[0]}
        image={imageMessage}
        markerData={{
          markers,
          cameraModel: null,
          originalWidth: null,
          originalHeight: null,
        }}
        config={config}
        saveConfig={noop}
      />
      <br />
      <h2>transformed markers</h2>
      <ImageCanvas
        topic={topics[1]}
        image={imageMessage}
        markerData={{
          markers,
          cameraModel: new CameraModel(cameraInfo),
          originalWidth: null,
          originalHeight: null,
        }}
        config={config}
        saveConfig={noop}
      />
      <h2>markers with different original image size</h2>
      <ImageCanvas
        topic={topics[1]}
        image={imageMessage}
        markerData={{
          markers,
          cameraModel: new CameraModel(cameraInfo),
          originalWidth: 200,
          originalHeight: 150,
        }}
        config={config}
        saveConfig={noop}
      />
    </div>
  ))
  .add("error state", () => {
    return (
      <ImageCanvas
        topic={topics[0]}
        image={{
          op: "message",
          datatype: "sensor_msgs/Image",
          topic: "/foo",
          receiveTime: { sec: 0, nsec: 0 },
          message: { data: new Uint8Array([]), width: 100, height: 50, encoding: "Foo" },
        }}
        markerData={null}
        config={config}
        saveConfig={noop}
      />
    );
  })
  .add("rgb8", () => <RGBStory encoding="rgb8" />)
  .add("bgr8", () => <RGBStory encoding="bgr8" />)
  .add("mono16 big endian", () => <Mono16Story bigEndian={true} />)
  .add("mono16 little endian", () => <Mono16Story bigEndian={false} />)
  .add("bayer_rggb8", () => <BayerStory encoding="bayer_rggb8" />)
  .add("bayer_bggr8", () => <BayerStory encoding="bayer_bggr8" />)
  .add("bayer_gbrg8", () => <BayerStory encoding="bayer_gbrg8" />)
  .add("bayer_grbg8", () => <BayerStory encoding="bayer_grbg8" />);
