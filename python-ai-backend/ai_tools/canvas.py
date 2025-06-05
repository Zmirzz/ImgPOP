"""Canvas manipulation utilities."""
from __future__ import annotations

from PIL import Image


def expand_canvas(image: Image.Image, new_size: tuple[int, int]) -> Image.Image:
    """Center the image on a new canvas of ``new_size`` with transparency."""
    new_w, new_h = new_size
    result = Image.new("RGBA", (new_w, new_h), (0, 0, 0, 0))
    left = max((new_w - image.width) // 2, 0)
    top = max((new_h - image.height) // 2, 0)
    result.paste(image, (left, top))
    return result


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Expand canvas around an image")
    parser.add_argument("--image", required=True, help="Path to input image")
    parser.add_argument("--width", type=int, required=True, help="New canvas width")
    parser.add_argument("--height", type=int, required=True, help="New canvas height")
    parser.add_argument("--output", required=True, help="Where to save the result")
    args = parser.parse_args()

    img = Image.open(args.image)
    out = expand_canvas(img, (args.width, args.height))
    out.save(args.output)
