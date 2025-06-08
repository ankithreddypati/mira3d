
import { useState, useRef, useEffect } from 'react';
import './app.css';

const ChatBot = () => {
  const backendUrl = window.location.origin + "/invocations";
  console.log("backend api root:", backendUrl);

  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", isBot: true }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileBase64, setFileBase64] = useState(null);
  const [useRembg, setUseRembg] = useState(true);
  const [useDownsample, setUseDownsample] = useState(true);
  const [useTexture, setUseTexture] = useState(true);

  const messagesEndRef = useRef(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = (file) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setFileBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileBase64(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!fileBase64 && !inputMessage.trim()) return;

    const isImage = selectedFile?.type?.startsWith('image/');
    const isVideo = selectedFile?.type?.startsWith('video/');

    const newMessage = {
      text: inputMessage || (selectedFile ? `[File: ${selectedFile.name}]` : ''),
      isBot: false,
      file: selectedFile,
    };
    setMessages(prev => [
      ...prev,
      newMessage,
      { text: "Processing...", isBot: true }
    ]);

    let payload;
    if (isVideo) {
      payload = {
        inputs: {
          video_path: fileBase64,
          use_rembg: useRembg,
          use_downsample: useDownsample
        },
        params: {}
      };
    } else if (isImage || inputMessage.trim()) {
      payload = {
        inputs: {
          image_path: [fileBase64],
          prompt: [inputMessage],
          use_texture: [useTexture]
        },
        params: {}
      };
    }

    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.text();
      setMessages(prev => [...prev, { text: data, isBot: true }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { text: "Error talking to backend.", isBot: true }]);
    }

    setInputMessage('');
    setSelectedFile(null);
    setFileBase64(null);
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

  const isImage = selectedFile?.type?.startsWith('image/');
  const isVideo = selectedFile?.type?.startsWith('video/');

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`} style={isOpen ? { left: position.x, top: position.y } : { position: 'fixed', bottom: 20, right: 20 }}>
      {!isOpen && (
        <button
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
        >
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
                {message.file?.type?.startsWith('image/') && (
                  <img src={URL.createObjectURL(message.file)} alt="preview" style={{ maxWidth: '100%' }} />
                )}
                {message.file?.type?.startsWith('video/') && (
                  <video controls style={{ maxWidth: '100%' }}>
                    <source src={URL.createObjectURL(message.file)} type={message.file.type} />
                  </video>
                )}
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {selectedFile && (
            <div className="preview-container">
              <div style={{ position: 'relative' }}>
                {isImage && <img src={URL.createObjectURL(selectedFile)} alt="preview" style={{ maxWidth: '100%' }} />}
                {isVideo && <video controls style={{ maxWidth: '100%' }}><source src={URL.createObjectURL(selectedFile)} /></video>}
                <button onClick={handleRemoveFile} style={{ position: 'absolute', top: 4, right: 4 }}>×</button>
              </div>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {isVideo && (
                  <>
                    <label style={{ color: 'white' }}><input type="checkbox" checked={useRembg} onChange={() => setUseRembg(!useRembg)} /> Remove Background</label>
                    <label style={{ color: 'white' }}><input type="checkbox" checked={useDownsample} onChange={() => setUseDownsample(!useDownsample)} /> Downsample</label>
                  </>
                )}
                {isImage && (
                  <label style={{ color: 'white' }}><input type="checkbox" checked={useTexture} onChange={() => setUseTexture(!useTexture)} /> Use Texture</label>
                )}
              </div>
            </div>
          )}

          {!selectedFile && inputMessage.trim() !== '' && (
            <div className="toggle-container" style={{ marginTop: 8 }}>
              <label style={{ color: 'white' }}><input type="checkbox" checked={useTexture} onChange={() => setUseTexture(!useTexture)} /> Use Texture</label>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="input-container">
            <label htmlFor="media-upload" className="media-button">+</label>
            <input
              id="media-upload"
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleFileUpload(file);
              }}
            />
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a prompt..."
              disabled={!!selectedFile}
            />
            <button type="submit" disabled={!fileBase64 && !inputMessage.trim()}>
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
