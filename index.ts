import { cubePositionOffset } from "./src/meshes/cube.js";

const basicVertWgslPromise = fetch("/src/shaders/basic_vert.wgsl").then(res => res.text())
const vertexPositionColorWgslPromise = fetch("/src/shaders/vertexPositionColor_frag.wgsl").then(res => res.text());

// @ts-ignore
if (!navigator || !navigator.gpu) {
  throw new Error("WebGPU not suported on this browser");
}

const canvas = document.querySelector("canvas");
if(!canvas) throw new Error("Canvas not found");

const devicePixelRatio = window.devicePixelRatio;
canvas.width = canvas.clientWidth * devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;

// @ts-ignore
navigator.gpu.requestAdapter().then(
  (adapter: GPUAdapter|null) => {
    if (!adapter) throw new Error("Adapter not found")
    adapter.requestDevice().then((device: GPUDevice|null) => {
      if (!device) throw new Error("device not found")
      const context = canvas.getContext("webgpu");
      if(!context) throw new Error("Context not found")
      const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

      context.configure({
        device: device,
        format: canvasFormat,
        alphaMode: "premultiplied",
      });

      Promise.all([basicVertWgslPromise, vertexPositionColorWgslPromise]).then(([basicVertWgsl, vertexPositionColorWgsl]) => {
        main({
          device: device,
          basicVertWgsl: basicVertWgsl,
          vertexPositionColorWgsl: vertexPositionColorWgsl
        });
      })
    });
  },
  () => {
    throw new Error("No appropriate GPUAdapter found.");
  }
);

interface IMain {
  device: GPUDevice
  basicVertWgsl: string
  vertexPositionColorWgsl: string
}

function main(args: IMain) {

  console.log('---', args);
//   // Create a vertex buffer from the cube data.
//   const verticesBuffer = device.createBuffer({
//     size: cubeVertexArray.byteLength,
//     usage: GPUBufferUsage.VERTEX,
//     mappedAtCreation: true,
//   });

//   // new Float32Array(verticesBuffer.getMappedRange()).set(cubeVertexArray);
//   // verticesBuffer.unmap();

//   // const pipeline = device.createRenderPipeline({
//   //   layout: "auto",
//   //   vertex: {
//   //     module: device.createShaderModule({
//   //       code: basicVertWGSL,
//   //     }),
//   //     entryPoint: "main",
//   //     buffers: [
//   //       {
//   //         arrayStride: cubeVertexSize,
//   //         attributes: [
//   //           {
//   //             // position
//   //             shaderLocation: 0,
//   //             offset: cubePositionOffset,
//   //             format: "float32x4",
//   //           },
//   //           {
//   //             // uv
//   //             shaderLocation: 1,
//   //             offset: cubeUVOffset,
//   //             format: "float32x2",
//   //           },
//   //         ],
//   //       },
//   //     ],
//   //   },
//   //   fragment: {
//   //     module: device.createShaderModule({
//   //       code: vertexPositionColorWGSL,
//   //     }),
//   //     entryPoint: "main",
//   //     targets: [
//   //       {
//   //         format: presentationFormat,
//   //       },
//   //     ],
//   //   },
//   //   primitive: {
//   //     topology: "triangle-list",

//   //     // Backface culling since the cube is solid piece of geometry.
//   //     // Faces pointing away from the camera will be occluded by faces
//   //     // pointing toward the camera.
//   //     cullMode: "back",
//   //   },

//   //   // Enable depth testing so that the fragment closest to the camera
//   //   // is rendered in front.
//   //   depthStencil: {
//   //     depthWriteEnabled: true,
//   //     depthCompare: "less",
//   //     format: "depth24plus",
//   //   },
//   // });

//   // const depthTexture = device.createTexture({
//   //   size: [canvas.width, canvas.height],
//   //   format: "depth24plus",
//   //   usage: GPUTextureUsage.RENDER_ATTACHMENT,
//   // });

//   // const uniformBufferSize = 4 * 16; // 4x4 matrix
//   // const uniformBuffer = device.createBuffer({
//   //   size: uniformBufferSize,
//   //   usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
//   // });

//   // const uniformBindGroup = device.createBindGroup({
//   //   layout: pipeline.getBindGroupLayout(0),
//   //   entries: [
//   //     {
//   //       binding: 0,
//   //       resource: {
//   //         buffer: uniformBuffer,
//   //       },
//   //     },
//   //   ],
//   // });

//   // const renderPassDescriptor = {
//   //   colorAttachments: [
//   //     {
//   //       view: undefined, // Assigned later

//   //       clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
//   //       loadOp: "clear",
//   //       storeOp: "store",
//   //     },
//   //   ],
//   //   depthStencilAttachment: {
//   //     view: depthTexture.createView(),

//   //     depthClearValue: 1.0,
//   //     depthLoadOp: "clear",
//   //     depthStoreOp: "store",
//   //   },
//   // };

//   // const aspect = canvas.width / canvas.height;
//   // const projectionMatrix = mat4.perspective(
//   //   (2 * Math.PI) / 5,
//   //   aspect,
//   //   1,
//   //   100.0
//   // );
//   // const modelViewProjectionMatrix = mat4.create();

//   // function getTransformationMatrix() {
//   //   const viewMatrix = mat4.identity();
//   //   mat4.translate(viewMatrix, vec3.fromValues(0, 0, -4), viewMatrix);
//   //   const now = Date.now() / 1000;
//   //   mat4.rotate(
//   //     viewMatrix,
//   //     vec3.fromValues(Math.sin(now), Math.cos(now), 0),
//   //     1,
//   //     viewMatrix
//   //   );

//   //   mat4.multiply(projectionMatrix, viewMatrix, modelViewProjectionMatrix);

//   //   return modelViewProjectionMatrix;
//   // }

//   // function frame() {
//   //   // Sample is no longer the active page.
//   //   if (!pageState.active) return;

//   //   const transformationMatrix = getTransformationMatrix();
//   //   device.queue.writeBuffer(
//   //     uniformBuffer,
//   //     0,
//   //     transformationMatrix.buffer,
//   //     transformationMatrix.byteOffset,
//   //     transformationMatrix.byteLength
//   //   );
//   //   renderPassDescriptor.colorAttachments[0].view = context
//   //     .getCurrentTexture()
//   //     .createView();

//   //   const commandEncoder = device.createCommandEncoder();
//   //   const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
//   //   passEncoder.setPipeline(pipeline);
//   //   passEncoder.setBindGroup(0, uniformBindGroup);
//   //   passEncoder.setVertexBuffer(0, verticesBuffer);
//   //   passEncoder.draw(cubeVertexCount);
//   //   passEncoder.end();
//   //   device.queue.submit([commandEncoder.finish()]);

//   //   requestAnimationFrame(frame);
//   // }
//   // requestAnimationFrame(frame);

}
