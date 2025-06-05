# ImgPOP: AI-Powered Image Editor

ImgPOP combines an Electron/React front‑end with a Python AI backend to offer a desktop image editing experience. The tools run locally so your images never leave your machine.

## Requirements

- **Node.js 18+** for the Electron UI
- **Python 3.9+** for the AI backend

On Linux you may install system packages like `build-essential` and `python3-dev` for compiling some dependencies.

## Installation

### Backend

```bash
pip install -r python-ai-backend/requirements.txt
```
Run the server directly with:
```bash
python python-ai-backend/app.py
```
It starts on port `5001` by default.

### Frontend

```bash
cd electron-app
npm install
```
During development start the Electron window with:
```bash
npm run dev
```
This launches the Vite dev server and then opens Electron. The production build can be started with `npm start` after running `npm run build:react`.

### Docker

Alternatively run everything together via Docker Compose:
```bash
docker-compose up --build
```

## Features and Models

| Feature | Open‑source model |
| ------- | ---------------- |
| Generative fill | Stable Diffusion Inpainting |
| Expand/outpainting | Stable Diffusion (outpainting) |
| Background removal | U^2-Net segmentation |
| Cleanup/erase | LaMa inpainting |
| Upscaling | Real‑ESRGAN |
| OCR | Tesseract OCR |

All processing happens locally using the models above. A GPU with at least **8 GB** of VRAM is recommended for best performance, though CPU mode also works at a slower pace.

## Running your own scripts

You can import the modules from `python-ai-backend` in your own Python code. For example:
```python
from app import resize_image
```
See `python-ai-backend/app.py` for reference implementations of each API.


