"""Utility functions for AI-driven image manipulation."""

from PIL import Image, ImageDraw


def expand_image(image: Image.Image, target_width: int, target_height: int, prompt: str = "outpainting") -> Image.Image:
    """Expand an image to the given dimensions using generative outpainting."""
    original_width, original_height = image.size
    if target_width <= original_width and target_height <= original_height:
        return image

    try:
        from diffusers import StableDiffusionInpaintPipeline
        import torch
    except Exception as err:
        raise RuntimeError("Diffusers with a suitable inpainting model is required for expand_image") from err

    try:
        pipe = StableDiffusionInpaintPipeline.from_pretrained(
            "runwayml/stable-diffusion-inpainting",
            torch_dtype=torch.float16,
        )
        device = "cuda" if torch.cuda.is_available() else "cpu"
        pipe = pipe.to(device)
    except Exception as err:
        raise RuntimeError("Failed to load generative model files") from err

    canvas = Image.new("RGB", (target_width, target_height), (255, 255, 255))
    x_off = (target_width - original_width) // 2
    y_off = (target_height - original_height) // 2
    canvas.paste(image, (x_off, y_off))

    mask = Image.new("L", (target_width, target_height), 0)
    draw = ImageDraw.Draw(mask)
    draw.rectangle([0, 0, target_width, y_off], fill=255)
    draw.rectangle([0, 0, x_off, target_height], fill=255)
    draw.rectangle([target_width - x_off, 0, target_width, target_height], fill=255)
    draw.rectangle([0, target_height - y_off, target_width, target_height], fill=255)

    result = pipe(prompt=prompt, image=canvas, mask_image=mask).images[0]
    return result
