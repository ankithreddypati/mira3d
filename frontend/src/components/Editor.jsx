import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useControls, folder, button } from "leva";
import * as THREE from "three";
import { Splat } from "./Splat";

export const Editor = ({ splats = [], onUpdateSplats = () => {} }) => {
  const { scene, camera, gl } = useThree();
  const boxHelperRef = useRef();
  const [selected, setSelected] = useState(null);

  // Leva: Transform controls
  const [{ position, rotation, scale }, set] = useControls(() => ({
    TRANSFORM: folder({
      position: { value: { x: 0, y: 0, z: 0 }, min: -10, max: 10, step: 0.1 },
      rotation: { value: { x: 0, y: 0, z: 0 }, min: 0, max: 360, step: 1 },
      scale: { value: 1, min: 0.1, max: 5, step: 0.1 }
    })
  }));

  // Leva: Show/Hide and Delete for splats
  useControls(() => {
    const controls = {};
    splats
      .filter((s) => !s.deleted)
      .forEach((splat) => {
        controls[splat.name] = folder({
          Visible: {
            value: splat.visible,
            onChange: (v) => {
              const updated = [...splats];
              const idx = updated.findIndex((s) => s.name === splat.name);
              if (idx !== -1) {
                updated[idx].visible = v;
                onUpdateSplats(updated);
              }
            }
          },
          Delete: button(() => {
            const updated = [...splats];
            const idx = updated.findIndex((s) => s.name === splat.name);
            if (idx !== -1) {
              updated[idx].deleted = true;
              onUpdateSplats(updated);
              if (selected?.name === `splat-${splat.name}`) {
                setSelected(null);
              }
            }
          })
        });
      });
    return controls;
  }, [splats, selected]);

  // Click to select splat via raycast
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        const obj = hit.object.parent;
        if (obj?.userData?.isSplat) {
          setSelected(obj);
          set({
            position: {
              x: obj.position.x,
              y: obj.position.y,
              z: obj.position.z
            },
            rotation: {
              x: THREE.MathUtils.radToDeg(obj.rotation.x),
              y: THREE.MathUtils.radToDeg(obj.rotation.y),
              z: THREE.MathUtils.radToDeg(obj.rotation.z)
            },
            scale: obj.scale.x
          });
          return;
        }
      }

      setSelected(null);
    };

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [scene, camera, gl, set]);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleDrop = (event) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];

      if (file && file.name.endsWith(".splat")) {
        const url = URL.createObjectURL(file);
        const name = file.name;
        const newSplat = {
          name,
          url,
          visible: true,
          deleted: false,
          position: [0, 0, 0]
        };
        onUpdateSplats((prev) => [...prev, newSplat]);
      }
    };

    const handleDragOver = (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    };

    canvas.addEventListener("drop", handleDrop);
    canvas.addEventListener("dragover", handleDragOver);

    return () => {
      canvas.removeEventListener("drop", handleDrop);
      canvas.removeEventListener("dragover", handleDragOver);
    };
  }, [gl.domElement, onUpdateSplats]);

  // Update selected splat with leva values
  useFrame(() => {
    if (selected?.userData?.isSplat) {
      selected.position.set(position.x, position.y, position.z);
      selected.rotation.set(
        (rotation.x * Math.PI) / 180,
        (rotation.y * Math.PI) / 180,
        (rotation.z * Math.PI) / 180
      );
      selected.scale.set(scale, scale, scale);
    }

    if (boxHelperRef.current && selected?.userData?.isSplat) {
      boxHelperRef.current.setFromObject(selected);
      boxHelperRef.current.visible = true;
    } else if (boxHelperRef.current) {
      boxHelperRef.current.visible = false;
    }
  });

  return (
    <>
      <OrbitControls />
      <gridHelper args={[40, 40]} position={[0, 0, 0]} />
      <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
        <GizmoViewport axisColors={["red", "green", "blue"]} labelColor="white" />
      </GizmoHelper>

      {splats.map((splat, i) =>
        !splat.deleted && splat.visible ? (
          <group
            key={`${splat.name}-${i}`}
            name={`splat-${splat.name}`}
            userData={{ isSplat: true }}
            position={splat.position}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(e.currentTarget);
              set({
                position: {
                  x: e.object.position.x,
                  y: e.object.position.y,
                  z: e.object.position.z
                },
                rotation: {
                  x: THREE.MathUtils.radToDeg(e.object.rotation.x),
                  y: THREE.MathUtils.radToDeg(e.object.rotation.y),
                  z: THREE.MathUtils.radToDeg(e.object.rotation.z)
                },
                scale: e.object.scale.x
              });
            }}
          >
            <Splat url={splat.url} maxSplats={10_000_000} />
          </group>
        ) : null
      )}

      <primitive
        ref={boxHelperRef}
        object={new THREE.BoxHelper(undefined, 0xffff00)}
        visible={false}
      />
    </>
  );
};





































