"""Image cleanup utilities using inpainting."""
from __future__ import annotations

from PIL import Image
import torch
from diffusers import StableDiffusionInpaintPipeline


def cleanup(image: Image.Image, mask: Image.Image) -> Image.Image:
    """Remove objects in ``mask`` from ``image`` via inpainting."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    pipe = StableDiffusionInpaintPipeline.from_pretrained(
        "stabilityai/stable-diffusion-2-inpainting",
        torch_dtype=torch.float16 if device.type == "cuda" else torch.float32,
    )
    pipe = pipe.to(device)

    image = image.convert("RGB")
    mask = mask.convert("RGB")
    result = pipe(prompt="", image=image, mask_image=mask).images[0]
    return result


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Cleanup objects from an image")
    parser.add_argument("--image", required=True, help="Path to input image")
    parser.add_argument("--mask", required=True, help="Path to mask image")
    parser.add_argument("--output", required=True, help="Where to save the result")
    args = parser.parse_args()

    img = Image.open(args.image)
    mask = Image.open(args.mask)
    out = cleanup(img, mask)
    out.save(args.output)
