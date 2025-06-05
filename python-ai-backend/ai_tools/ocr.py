"""Optical character recognition utilities."""
from __future__ import annotations

from PIL import Image
import pytesseract


def extract_text(image: Image.Image) -> str:
    """Extract text from ``image`` using Tesseract."""
    return pytesseract.image_to_string(image)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Extract text from an image")
    parser.add_argument("--image", required=True, help="Path to input image")
    args = parser.parse_args()

    img = Image.open(args.image)
    print(extract_text(img))
