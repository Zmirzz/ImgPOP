"""Background removal utilities."""
from __future__ import annotations

from PIL import Image
from rembg import remove


def remove_background(image: Image.Image) -> Image.Image:
    """Remove background from ``image`` using ``rembg``."""
    return remove(image)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Remove background from an image")
    parser.add_argument("--image", required=True, help="Path to input image")
    parser.add_argument("--output", required=True, help="Where to save the result")
    args = parser.parse_args()

    img = Image.open(args.image)
    out = remove_background(img)
    out.save(args.output)
