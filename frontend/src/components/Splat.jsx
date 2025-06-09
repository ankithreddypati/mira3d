// import { useCallback, useEffect, useRef, useState } from "react";
// import * as THREE from "three";
// import { useFrame, useThree } from "@react-three/fiber";
// // import SplatSortWorker from "./splat-sort-worker?worker";
// import { useMemo } from "react";
// import { fragmentShaderSource, vertexShaderSource } from "./splat-shaders";

// const computeFocalLengths = (width, height, fov, aspect, dpr) => {
//   const fovRad = THREE.MathUtils.degToRad(fov);
//   const fovXRad = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
//   const fy = (dpr * height) / (2 * Math.tan(fovRad / 2));
//   const fx = (dpr * width) / (2 * Math.tan(fovXRad / 2));
//   return new THREE.Vector2(fx, fy);
// };

// export function Splat({ url, maxSplats = Infinity }) {
//   const ref = useRef(null);
//   // const [worker] = useState(() => new SplatSortWorker());
//     const worker = useMemo(() => {
//   return new Worker(new URL("./splat-sort-worker.ts", import.meta.url), { type: "module" });
// }, []);


//   const {
//     size: { width, height },
//     camera: { fov, aspect },
//     viewport: { dpr },
//   } = useThree();

//   const [uniforms] = useState({
//     viewport: { value: new THREE.Vector2(width * dpr, height * dpr) },
//     focal: { value: computeFocalLengths(width, height, fov, aspect, dpr) },
//   });

//   useEffect(() => {
//     uniforms.focal.value = computeFocalLengths(width, height, fov, aspect, dpr);
//     uniforms.viewport.value = new THREE.Vector2(width * dpr, height * dpr);
//   }, [width, height, fov, aspect, dpr]);

//   const [buffers, setBuffers] = useState({
//     index: new Uint16Array([0, 1, 2, 2, 3, 0]),
//     position: new Float32Array([1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 1, 0]),
//     color: new Float32Array([1, 0, 1, 1, 1, 1, 0, 1]),
//     quat: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1]),
//     scale: new Float32Array([1, 1, 1, 2, 0.5, 0.5]),
//     center: new Float32Array([0, 0, 0, 2, 0, 0]),
//   });

//   useFrame((state) => {
//     const mesh = ref.current;
//     if (!mesh) return;
//     const camera = state.camera;
//     const viewProj = new THREE.Matrix4()
//       .multiply(camera.projectionMatrix)
//       .multiply(camera.matrixWorldInverse)
//       .multiply(mesh.matrixWorld);
//     worker.postMessage({ view: viewProj.elements, maxSplats });
//   });

//   useEffect(() => {
//     worker.onmessage = (e) => {
//       const { quat, scale, center, color } = e.data;
//       setBuffers((b) => ({ ...b, quat, scale, center, color }));
//     };
//     return () => (worker.onmessage = null);
//   }, []);

//   useEffect(() => {
//     let stopLoading = false;
//     const loadModel = async () => {
//       const req = await fetch(url);
//       if (!req.body) {
//   console.error("No body in response. Possibly invalid SPLAT file.");
//   return;
// }
//       const length = parseInt(req.headers.get("content-length"));
//       const rowLength = 32;
//       let splatData = new Uint8Array(length);
//       let bytesRead = 0;

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done || stopLoading) break;
//         splatData.set(value, bytesRead);
//         bytesRead += value.length;
//         worker.postMessage({
//           buffer: splatData.buffer,
//           vertexCount: Math.floor(bytesRead / rowLength),
//         });
//       }
//     };
//     loadModel();
//     return () => (stopLoading = true);
//   }, [url]);

//   const update = useCallback((attr) => (attr.needsUpdate = true), []);

//   const instanceCount = Math.min(buffers.quat.length / 4, maxSplats);

//   return (
//     <mesh ref={ref} renderOrder={10} rotation={[Math.PI, 0, 0]}>
//       <instancedBufferGeometry key={instanceCount} instanceCount={instanceCount}>
//         <bufferAttribute attach="index" onUpdate={update} array={buffers.index} itemSize={1} count={6} />
//         <bufferAttribute attach="attributes-position" onUpdate={update} array={buffers.position} itemSize={3} count={4} />
//         <instancedBufferAttribute attach="attributes-color" onUpdate={update} array={buffers.color} itemSize={4} count={instanceCount} />
//         <instancedBufferAttribute attach="attributes-quat" onUpdate={update} array={buffers.quat} itemSize={4} count={instanceCount} />
//         <instancedBufferAttribute attach="attributes-scale" onUpdate={update} array={buffers.scale} itemSize={3} count={instanceCount} />
//         <instancedBufferAttribute attach="attributes-center" onUpdate={update} array={buffers.center} itemSize={3} count={instanceCount} />
//       </instancedBufferGeometry>
//       <rawShaderMaterial
//         uniforms={uniforms}
//         fragmentShader={fragmentShaderSource}
//         vertexShader={vertexShaderSource}
//         depthTest={true}
//         depthWrite={false}
//         transparent
//       />
//     </mesh>
//   );
// }
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
// import SplatSortWorker from "./splat-sort-worker?worker";
import { useMemo } from "react";
import { fragmentShaderSource, vertexShaderSource } from "./splat-shaders";

const computeFocalLengths = (width, height, fov, aspect, dpr) => {
  const fovRad = THREE.MathUtils.degToRad(fov);
  const fovXRad = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
  const fy = (dpr * height) / (2 * Math.tan(fovRad / 2));
  const fx = (dpr * width) / (2 * Math.tan(fovXRad / 2));
  return new THREE.Vector2(fx, fy);
};

export function Splat({ url, maxSplats = Infinity }) {
  const ref = useRef(null);
  // const [worker] = useState(() => new SplatSortWorker());
  const worker = useMemo(() => {
    return new Worker(new URL("./splat-sort-worker.ts", import.meta.url), { type: "module" });
  }, []);

  const {
    size: { width, height },
    camera: { fov, aspect },
    viewport: { dpr },
  } = useThree();

  const [uniforms] = useState({
    viewport: { value: new THREE.Vector2(width * dpr, height * dpr) },
    focal: { value: computeFocalLengths(width, height, fov, aspect, dpr) },
  });

  useEffect(() => {
    uniforms.focal.value = computeFocalLengths(width, height, fov, aspect, dpr);
    uniforms.viewport.value = new THREE.Vector2(width * dpr, height * dpr);
  }, [width, height, fov, aspect, dpr]);

  const [buffers, setBuffers] = useState({
    index: new Uint16Array([0, 1, 2, 2, 3, 0]),
    position: new Float32Array([1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 1, 0]),
    color: new Float32Array([1, 0, 1, 1, 1, 1, 0, 1]),
    quat: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1]),
    scale: new Float32Array([1, 1, 1, 2, 0.5, 0.5]),
    center: new Float32Array([0, 0, 0, 2, 0, 0]),
  });

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const camera = state.camera;
    const viewProj = new THREE.Matrix4()
      .multiply(camera.projectionMatrix)
      .multiply(camera.matrixWorldInverse)
      .multiply(mesh.matrixWorld);
    worker.postMessage({ view: viewProj.elements, maxSplats });
  });

  useEffect(() => {
    worker.onmessage = (e) => {
      const { quat, scale, center, color } = e.data;
      setBuffers((b) => ({ ...b, quat, scale, center, color }));
    };
    return () => (worker.onmessage = null);
  }, []);

  useEffect(() => {
    let stopLoading = false;
    const loadModel = async () => {
      const req = await fetch(url);

      if (!req.body) {
        console.error("No body in response. Possibly invalid SPLAT file.");
        return;
      }

      const contentLength = req.headers.get("content-length");
      if (!contentLength) {
        console.error("Missing content-length header.");
        return;
      }

      const length = parseInt(contentLength);
      if (isNaN(length) || length <= 0) {
        console.error("Invalid content-length:", contentLength);
        return;
      }

      const reader = req.body.getReader();
      const rowLength = 32;
      let splatData = new Uint8Array(length);
      let bytesRead = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done || stopLoading) break;
        splatData.set(value, bytesRead);
        bytesRead += value.length;
        worker.postMessage({
          buffer: splatData.buffer,
          vertexCount: Math.floor(bytesRead / rowLength),
        });
      }
    };
    loadModel();
    return () => (stopLoading = true);
  }, [url]);

  const update = useCallback((attr) => (attr.needsUpdate = true), []);

  const instanceCount = Math.min(buffers.quat.length / 4, maxSplats);

  return (
    <mesh ref={ref} renderOrder={10} rotation={[Math.PI, 0, 0]}>
      <instancedBufferGeometry key={instanceCount} instanceCount={instanceCount}>
        <bufferAttribute attach="index" onUpdate={update} array={buffers.index} itemSize={1} count={6} />
        <bufferAttribute attach="attributes-position" onUpdate={update} array={buffers.position} itemSize={3} count={4} />
        <instancedBufferAttribute attach="attributes-color" onUpdate={update} array={buffers.color} itemSize={4} count={instanceCount} />
        <instancedBufferAttribute attach="attributes-quat" onUpdate={update} array={buffers.quat} itemSize={4} count={instanceCount} />
        <instancedBufferAttribute attach="attributes-scale" onUpdate={update} array={buffers.scale} itemSize={3} count={instanceCount} />
        <instancedBufferAttribute attach="attributes-center" onUpdate={update} array={buffers.center} itemSize={3} count={instanceCount} />
      </instancedBufferGeometry>
      <rawShaderMaterial
        uniforms={uniforms}
        fragmentShader={fragmentShaderSource}
        vertexShader={vertexShaderSource}
        depthTest={true}
        depthWrite={false}
        transparent
      />
    </mesh>
  );
}
