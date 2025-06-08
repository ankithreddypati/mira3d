import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Editor } from "./components/Editor";
import { Leva } from "leva";
import ChatBot from "./components/chatbot";
import Menubar from "./components/Menubar";
import Gallery from "./components/Gallery";
import { PerformanceMonitor, StatsGl } from "@react-three/drei";

function App() {
  const [activeView, setActiveView] = useState("editor");

  return (
    <>
      <Menubar activeView={activeView} onViewChange={setActiveView} />

      {activeView === "editor" ? (
        <>
          <Canvas shadows camera={{ position: [3, 3, 3], fov: 60 }}>
            <color attach="background" args={["#ececec"]} />

            {/* Show live FPS */}
            <StatsGl />

            {/* Watch performance drops */}
            <PerformanceMonitor
              onDecline={() => {
                console.warn("⚠️ Performance dropped");
              }}
              onIncline={() => {
                console.log("✅ Performance improved");
              }}
            />

            <Editor />
          </Canvas>
          <ChatBot />
        </>
      ) : (
        <Gallery />
      )}
    </>
  );
}

export default App;
