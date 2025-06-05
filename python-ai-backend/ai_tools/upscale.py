"""Image upscaling utilities."""
from __future__ import annotations

from PIL import Image
import numpy as np
import torch
from realesrgan import RealESRGAN


def upscale(image: Image.Image, factor: int = 4) -> Image.Image:
    """Upscale ``image`` using Real-ESRGAN by ``factor``."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = RealESRGAN(device, scale=factor)
    model.load_weights(f"RealESRGAN_x{factor}.pth")
    result = model.predict(np.array(image))
    return Image.fromarray(result)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Upscale an image with Real-ESRGAN")
    parser.add_argument("--image", required=True, help="Path to input image")
    parser.add_argument("--factor", type=int, default=4, help="Upscale factor")
    parser.add_argument("--output", required=True, help="Where to save the result")
    args = parser.parse_args()

    img = Image.open(args.image)
    out = upscale(img, args.factor)
    out.save(args.output)
