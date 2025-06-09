

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Editor } from "./components/Editor";
import { Leva } from "leva";
import ChatBot from "./components/chatbot";
import Menubar from "./components/Menubar";
import Gallery from "./components/Gallery";

function App() {
  const [activeView, setActiveView] = useState("editor");
  const [splats, setSplats] = useState([]); 

  return (
    <>
      <Menubar activeView={activeView} onViewChange={setActiveView} />

      {activeView === "editor" ? (
        <>
          <Canvas shadows camera={{ position: [3, 3, 3], fov: 60 }}>
            <color attach="background" args={["#ececec"]} />
            <Editor splats={splats} /> 
          </Canvas>
          <ChatBot onNewSplat={(splat) => setSplats((prev) => [...prev, splat])} /> 
        </>
      ) : (
        <Gallery />
      )}
    </>
  );
}

export default App;
