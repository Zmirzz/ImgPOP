"""Functions for generative fill using Stable Diffusion inpainting."""
from __future__ import annotations

from PIL import Image
import torch
from diffusers import StableDiffusionInpaintPipeline


def generative_fill(image: Image.Image, mask: Image.Image, prompt: str) -> Image.Image:
    """Fill masked regions of ``image`` guided by ``prompt``.

    Parameters
    ----------
    image:
        The base image.
    mask:
        A binary mask where white regions will be inpainted.
    prompt:
        Text prompt describing the desired content.

    Returns
    -------
    Image.Image
        The generated image.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    pipe = StableDiffusionInpaintPipeline.from_pretrained(
        "stabilityai/stable-diffusion-2-inpainting",
        torch_dtype=torch.float16 if device.type == "cuda" else torch.float32,
    )
    pipe = pipe.to(device)

    image = image.convert("RGB")
    mask = mask.convert("RGB")
    result = pipe(prompt=prompt, image=image, mask_image=mask).images[0]
    return result


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generative fill using Stable Diffusion")
    parser.add_argument("--image", required=True, help="Path to input image")
    parser.add_argument("--mask", required=True, help="Path to mask image")
    parser.add_argument("--prompt", required=True, help="Prompt for inpainting")
    parser.add_argument("--output", required=True, help="Where to save the result")
    args = parser.parse_args()

    img = Image.open(args.image)
    mask = Image.open(args.mask)
    out = generative_fill(img, mask, args.prompt)
    out.save(args.output)
