
import { useState, useRef, useEffect } from 'react';
import './app.css';

const ChatBot = ({ onNewSplat }) => {
   //for mlflow swaggerUI 
 // const backendUrl = window.location.origin + "/invocations";

  //for dev test change here
  const backendUrl = "http://10.137.137.6:8000/upload/";

  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", isBot: true }
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [useRembg, setUseRembg] = useState(true);
  const [useDownsample, setUseDownsample] = useState(true);

  const messagesEndRef = useRef(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = (file) => setSelectedFile(file);
  const handleRemoveFile = () => setSelectedFile(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!selectedFile || !selectedFile.type?.startsWith("video/")) {
      setMessages(prev => [...prev, { text: "Only video files (.mp4, .mov) are supported.", isBot: true }]);
      return;
    }

    const newMessage = {
      text: `[File: ${selectedFile.name}]`,
      isBot: false,
      file: selectedFile,
    };
    setMessages(prev => [...prev, newMessage, { text: "Processing your video...", isBot: true }]);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("use_rembg", useRembg);
    formData.append("use_downsample", false);

    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Processing failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const splatName = selectedFile.name.replace(/\.[^/.]+$/, "") + ".splat";

      setMessages(prev => [...prev, {
        text: ` Download: ${splatName}`,
        link: url,
        filename: splatName, 
        isBot: true
      }]);

      if (onNewSplat) {
        onNewSplat({
          name: splatName,
          url: url,
          visible: true,     
          deleted: false,    
          position: [0, 0, 0] 
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { text: " Error processing video.", isBot: true }]);
    }

    setSelectedFile(null);
  };

  const onMouseDown = (e) => {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (dragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
    };
    const onMouseUp = () => {
      setDragging(false);
      document.body.style.userSelect = '';
    };
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging]);

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`} style={isOpen ? { left: position.x, top: position.y } : { position: 'fixed', bottom: 20, right: 20 }}>
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window chatbot-style">
          <div className="chatbot-header" onMouseDown={onMouseDown} style={{ cursor: 'grab' }}>
            <div className="chatbot-drag-handle">
              <span className="chatbot-dot" /><span className="chatbot-dot" /><span className="chatbot-dot" />
            </div>
            <h3>Mira3D</h3>
            <button className="close-button" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="messages-container">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.isBot ? 'bot' : 'user'}`}>
                {message.file && message.file.type?.startsWith('video/') && (() => {
                  try {
                    const videoURL = URL.createObjectURL(message.file);
                    return (
                      <video controls style={{ maxWidth: '100%' }}>
                        <source src={videoURL} type={message.file.type} />
                      </video>
                    );
                  } catch (e) {
                    console.warn("Invalid video blob:", e);
                    return null;
                  }
                })()}
                <div>
                  {message.text}
                  {message.link && (
                    <div>
                      <a href={message.link} download={message.filename || "output.splat"} style={{ color: '#4fc3f7' }}>
                         Download SPLAT
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {selectedFile && (
            <div className="preview-container">
              <div style={{ position: 'relative' }}>
                <video controls style={{ maxWidth: '100%' }}>
                  <source src={URL.createObjectURL(selectedFile)} />
                </video>
                <button onClick={handleRemoveFile} style={{ position: 'absolute', top: 4, right: 4 }}>×</button>
              </div>
             <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: '6px' }}>
  <label style={{ color: 'white' }}>
    <input type="checkbox" checked={useRembg} onChange={() => setUseRembg(!useRembg)} />
    Remove Background
  </label>
  <label style={{ color: 'white' }}>
    <input type="checkbox" checked={useDownsample} onChange={() => setUseDownsample(!useDownsample)} />
    Downsample
  </label>
</div>

            </div>
          )}

          <form onSubmit={handleSendMessage} className="input-container">
            <label htmlFor="media-upload" className="media-button">+</label>
            <input
              id="media-upload"
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleFileUpload(file);
              }}
            />
            <input
              type="text"
              placeholder="Video only"
              disabled
            />
            <button type="submit" disabled={!selectedFile}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(-90 12 12)" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;