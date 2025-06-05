import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [pingResponse, setPingResponse] = useState('Not yet pinged');
  const [pingError, setPingError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Resizer state
  const [originalDimensions, setOriginalDimensions] = useState(null); // { width, height }
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [expandImage, setExpandImage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);

  const imageRef = useRef(null); // To get natural dimensions of the previewed image

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
        setNewWidth('');
        setNewHeight('');
        setOriginalDimensions(null);
        setProcessingError(null);
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
      if (newWidth === '' || newHeight === '') {
        setNewWidth(naturalWidth.toString());
        setNewHeight(naturalHeight.toString());
      }
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
      setImagePreviewUrl(URL.createObjectURL(imageBlob));

    } catch (error) {
      console.error("Failed to resize image:", error);
      setProcessingError(error.message || "Failed to resize image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ImgPOP - AI Image Editor</h1>

        <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #555', borderRadius: '5px', opacity: isProcessing ? 0.7 : 1 }}>
          <h2>1. Load Image</h2>
          <input type="file" accept="image/*" onChange={handleImageChange} disabled={isProcessing} />
          {imagePreviewUrl && (
            <div style={{ marginTop: '20px' }}>
              <h3>Preview:</h3>
              <img 
                ref={imageRef} 
                src={imagePreviewUrl} 
                alt="Selected Preview" 
                style={{ maxWidth: '300px', maxHeight: '300px', border: '1px solid #ccc' }} 
                onLoad={onImageLoad}
              />
              {originalDimensions && (
                <p>Original Dim: {originalDimensions.width} x {originalDimensions.height}</p>
              )}
            </div>
          )}
        </div>

        <hr style={{margin: '20px 0', width: '80%'}}/>

        {selectedImage && originalDimensions && (
          <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #555', borderRadius: '5px', opacity: isProcessing ? 0.7 : 1 }}>
            <h2>2. Resize Image</h2>
            <div>
              <label htmlFor="width">Width: </label>
              <input type="number" id="width" value={newWidth} onChange={handleWidthChange} style={{width: "70px"}} disabled={isProcessing}/>
              <label htmlFor="height" style={{marginLeft: "10px"}}>Height: </label>
              <input type="number" id="height" value={newHeight} onChange={handleHeightChange} style={{width: "70px"}} disabled={isProcessing}/>
            </div>
            <div style={{marginTop: "10px"}}>
              <input 
                type="checkbox" 
                id="aspectRatio" 
                checked={maintainAspectRatio} 
                onChange={handleAspectRatioToggle} 
                disabled={isProcessing}
              />
              <label htmlFor="aspectRatio">Maintain aspect ratio</label>
            </div>
            <div style={{marginTop: "10px"}}>
              <input 
                type="checkbox" 
                id="expand" 
                checked={expandImage} 
                onChange={(e) => setExpandImage(e.target.checked)} 
                disabled={isProcessing}
              />
              <label htmlFor="expand">Expand canvas if new dimensions are larger</label>
            </div>
            <button onClick={handleApplyResize} style={{marginTop: "15px"}} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Apply Resize'}
            </button>
            {processingError && <p style={{color: '#ff7777', marginTop: '10px'}}>{processingError}</p>}
          </div>
        )}

        <hr style={{margin: '20px 0', width: '80%'}}/>

        <div style={{ opacity: isProcessing ? 0.7 : 1 }}>
          <h2>Backend Communication Test:</h2>
          <button onClick={handlePingBackend} disabled={isProcessing}>Ping Python Backend</button>
          <p>Response: <strong>{pingResponse}</strong></p>
          {pingError && <p style={{color: 'red'}}>Error: {pingError}</p>}
        </div>

        <hr style={{margin: '20px 0', width: '50%'}}/>

        <p style={{ opacity: isProcessing ? 0.7 : 1 }}>
          <button onClick={() => setCount((count) => count + 1)} disabled={isProcessing}>
            Test Counter is: {count}
          </button>
        </p>
        <p style={{ opacity: isProcessing ? 0.7 : 1 }}>
          Edit <code>src/renderer/App.jsx</code> and save to test HMR updates.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{ opacity: isProcessing ? 0.7 : 1 }}
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App; 