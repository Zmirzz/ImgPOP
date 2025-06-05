import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [pingResponse, setPingResponse] = useState('Not yet pinged');
  const [pingError, setPingError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Editor state
  const [activeTool, setActiveTool] = useState('Crop'); // Default tool

  // Resizer state (will be managed by Resize tool)
  const [originalDimensions, setOriginalDimensions] = useState(null); // { width, height }
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [expandImage, setExpandImage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);

  const imageRef = useRef(null); // To get natural dimensions of the previewed image

  const handleToolChange = (toolName) => {
    setActiveTool(toolName);
    // Reset or set up tool-specific states here if needed in the future
    if (toolName !== 'Resize') {
        setProcessingError(null); // Clear resize errors when switching away
    }
  };

  const handlePingBackend = async () => {
    setPingResponse('Pinging...');
    setPingError(null);
    try {
      const response = await fetch('http://localhost:5001/ping');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPingResponse(data.message);
    } catch (error) {
      console.error("Failed to ping backend:", error);
      setPingResponse('Failed to connect');
      setPingError(error.toString());
    }
  };

  const handleImageChange = (e) => {
    e.preventDefault();
    const reader = new FileReader();
    const file = e.target.files[0];

    if (file) {
      reader.onloadend = () => {
        setSelectedImage(file);
        setImagePreviewUrl(reader.result);
        setNewWidth(''); // Reset dimensions for new image
        setNewHeight('');
        setOriginalDimensions(null); // Will be set onImageLoad
        setProcessingError(null);
        // If an image is loaded, and no tool is selected, or a tool that needs an image is selected
        // you might want to set a default tool or ensure current tool is appropriate.
        // For now, just loading the image.
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreviewUrl(null);
      setOriginalDimensions(null);
      setNewWidth('');
      setNewHeight('');
      setProcessingError(null);
    }
  };

  const onImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setOriginalDimensions({ width: naturalWidth, height: naturalHeight });
      // Set initial dimensions for resize tool if it's active or becomes active
      setNewWidth(naturalWidth.toString());
      setNewHeight(naturalHeight.toString());
    }
  };

  const handleWidthChange = (e) => {
    const width = e.target.value;
    setNewWidth(width);
    if (maintainAspectRatio && originalDimensions && originalDimensions.width > 0 && width !== '') {
      const val = parseInt(width, 10);
      if (!isNaN(val) && val > 0) {
        const aspectRatio = originalDimensions.height / originalDimensions.width;
        setNewHeight(Math.round(val * aspectRatio).toString());
      } else if (width === '') {
        setNewHeight('');
      }
    }
  };

  const handleHeightChange = (e) => {
    const height = e.target.value;
    setNewHeight(height);
    if (maintainAspectRatio && originalDimensions && originalDimensions.height > 0 && height !== '') {
      const val = parseInt(height, 10);
      if (!isNaN(val) && val > 0) {
        const aspectRatio = originalDimensions.width / originalDimensions.height;
        setNewWidth(Math.round(val * aspectRatio).toString());
      } else if (height === '') {
        setNewWidth('');
      }
    }
  };

  const handleAspectRatioToggle = () => {
    const newMaintainAspectRatio = !maintainAspectRatio;
    setMaintainAspectRatio(newMaintainAspectRatio);
    if (newMaintainAspectRatio && newWidth && originalDimensions && originalDimensions.width > 0) {
      const val = parseInt(newWidth, 10);
       if (!isNaN(val) && val > 0) {
        const aspectRatio = originalDimensions.height / originalDimensions.width;
        setNewHeight(Math.round(val * aspectRatio).toString());
      }
    }
  };

  const handleApplyResize = async () => {
    if (!selectedImage || !newWidth || !newHeight) {
      setProcessingError("Please select an image and specify valid dimensions.");
      return;
    }
    setIsProcessing(true);
    setProcessingError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('width', newWidth);
    formData.append('height', newHeight);
    formData.append('expand', expandImage.toString());

    try {
      const response = await fetch('http://localhost:5001/resize-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error during resize." }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const imageBlob = await response.blob();
      const newImagePreviewUrl = URL.createObjectURL(imageBlob);
      setImagePreviewUrl(newImagePreviewUrl); // Update preview with resized image
      // Update selectedImage to the new blob if further operations are on the resized version
      // This might require changing how selectedImage is handled or introducing a 'processedImageBlob' state
      // For now, just updating the preview.
      // setSelectedImage(new File([imageBlob], selectedImage.name, { type: imageBlob.type }));

    } catch (error) {
      console.error("Failed to resize image:", error);
      setProcessingError(error.message || "Failed to resize image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTopBarCenterContent = () => {
    if (!selectedImage) return null;
    switch (activeTool) {
      case 'Crop':
        return (
          <>
            <button className="tool-button">Rotate Left</button>
            <button className="tool-button">Flip Horizontal</button>
            <button className="tool-button">Crop Shape</button>
          </>
        );
      // Add cases for other tools here
      default:
        return <span>{activeTool} Controls</span>;
    }
  };

 const renderBottomBarContent = () => {
    if (!selectedImage) return <p>Please load an image to enable tools.</p>;

    switch (activeTool) {
      case 'Resize':
        return (
          <div className="resize-controls-temporary"> {/* Use the class for styling */}
            <h3>Resize Image</h3>
            {originalDimensions && (<p>Original: {originalDimensions.width} x {originalDimensions.height}</p>)}
            <div>
              <label htmlFor="width">W: </label>
              <input type="number" id="width" value={newWidth} onChange={handleWidthChange} disabled={isProcessing || !originalDimensions}/>
              <label htmlFor="height" style={{marginLeft: "10px"}}>H: </label>
              <input type="number" id="height" value={newHeight} onChange={handleHeightChange} disabled={isProcessing || !originalDimensions}/>
            </div>
            <div style={{marginTop: "5px", fontSize: '0.9em'}}>
              <input
                type="checkbox"
                id="aspectRatio"
                checked={maintainAspectRatio}
                onChange={handleAspectRatioToggle}
                disabled={isProcessing || !originalDimensions}
              />
              <label htmlFor="aspectRatio">Lock Aspect</label>
            </div>
            <div style={{marginTop: "5px", fontSize: '0.9em'}}>
              <input
                type="checkbox"
                id="expand"
                checked={expandImage}
                onChange={(e) => setExpandImage(e.target.checked)}
                disabled={isProcessing || !originalDimensions}
              />
              <label htmlFor="expand">Expand canvas</label>
            </div>
            <button onClick={handleApplyResize} style={{marginTop: "10px"}} disabled={isProcessing || !originalDimensions}>
              {isProcessing ? 'Processing...' : 'Apply Resize'}
            </button>
            {processingError && <p style={{color: '#ff7777', marginTop: '5px'}}>{processingError}</p>}
          </div>
        );
      case 'Crop':
        return (
            <>
                <div style={{marginRight: '20px'}}>Rotation Slider Placeholder</div>
                <div>Scale Slider Placeholder</div>
            </>
        )
      // Add cases for other tools here
      default:
        return <p>{activeTool} options will appear here.</p>;
    }
  };

  const sidebarTools = ['Crop', 'Filter', 'Finetune', 'Redact', 'Annotate', 'Frame', 'Resize'];

  return (
    <div className="editor-container">
      <div className="top-bar">
        <div className="top-bar-left">
          <button className="tool-button icon-button">X</button>
          <button className="tool-button icon-button">{'<='}</button>
          <button className="tool-button icon-button">{'=>'}</button>
        </div>
        <div className="top-bar-center">
          {renderTopBarCenterContent()}
        </div>
        <div className="top-bar-right">
          <button className="action-button save-button">Save and close</button>
        </div>
      </div>

      <div className="main-content-area">
        <div className="left-sidebar">
          {sidebarTools.map(tool => (
            <button 
              key={tool}
              className={`tool-button ${activeTool === tool ? 'active' : ''}`}
              onClick={() => handleToolChange(tool)}
            >
              {tool}
            </button>
          ))}
        </div>

        <div className="image-display-area">
          {!imagePreviewUrl && (
            <div className="image-load-section">
              <h2>Load Image</h2>
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={isProcessing} />
            </div>
          )}

          {imagePreviewUrl && (
            <div className="image-preview-container">
              <img
                ref={imageRef}
                src={imagePreviewUrl}
                alt="Selected Preview"
                className="main-image-preview"
                onLoad={onImageLoad}
              />
            </div>
          )}
          {/* Temporary resize controls are now in the bottom bar, conditional on activeTool === 'Resize' */}
        </div>
      </div>

      <div className="bottom-bar">
        {renderBottomBarContent()}
      </div>

      {/* Test utilities - to be removed later */}
      <div style={{ position: 'fixed', bottom: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '3px', fontSize: '0.7em', display: 'none' }}>
          <button onClick={handlePingBackend} disabled={isProcessing} style={{marginRight: '5px'}}>Ping Backend ({pingResponse})</button>
          <button onClick={() => setCount((count) => count + 1)} disabled={isProcessing}>Counter: {count}</button>
          {pingError && <p style={{color: 'red'}}>Error: {pingError}</p>}
      </div>
    </div>
  );
}

export default App; 