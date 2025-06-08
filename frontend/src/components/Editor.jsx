
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useControls, folder } from "leva";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Splat } from "./Splat";

export const Editor = () => {
  const splatGroupRef = useRef();
  const boxRef = useRef();
  const selectedRef = useRef();

  const [visible, setVisible] = useState(true);

  // Transform Controls using folders and sliders
  const [{ position, rotation, scale }, set] = useControls(() => ({
    "SCENE MANAGER": folder({
      shivacore: {
        label: "shivacore.ply",
        value: true,
        onChange: (v) => setVisible(v),
      },
    }),
    TRANSFORM: folder({
      position: {
        value: { x: 0, y: 0, z: 0 },
        min: -10,
        max: 10,
        step: 0.1,
      },
      rotation: {
        value: { x: 0, y: 0, z: 0 },
        min: 0,
        max: 360,
        step: 1,
      },
      scale: {
        value: 1,
        min: 0.1,
        max: 5,
        step: 0.1,
      },
    }),
  }));

  // Apply transforms to selected object
  useFrame(() => {
    if (selectedRef.current) {
      selectedRef.current.position.set(position.x, position.y, position.z);
      selectedRef.current.rotation.set(
        (rotation.x * Math.PI) / 180,
        (rotation.y * Math.PI) / 180,
        (rotation.z * Math.PI) / 180
      );
      selectedRef.current.scale.set(scale, scale, scale);
    }
  });

  // Click-to-select
  const handleSelect = (ref) => {
    if (ref.current) selectedRef.current = ref.current;
  };

  return (
    <>
      <OrbitControls />
      <gridHelper args={[40, 40]} position={[0, 0, 0]} />
      <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
        <GizmoViewport axisColors={["red", "green", "blue"]} labelColor="white" />
      </GizmoHelper>

  {/* 
      <mesh ref={boxRef} onClick={() => handleSelect(boxRef)} position={[-2, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh> */}

      {/* SPLAT */}
      {visible && (
        <group ref={splatGroupRef} onClick={() => handleSelect(splatGroupRef)}>
          <Splat url="./shiva.splat" maxSplats={10000000} />
        </group>
      )}
    </>
  );
};
