"""
Simple script to generate placeholder project thumbnails using PIL.
Run this script to create placeholder images for the portfolio projects.
"""

from PIL import Image, ImageDraw, ImageFont
import os


def create_placeholder_thumbnail(title, filename, size=(1200, 600)):
    """Create a placeholder thumbnail with project title."""
    # Create image with gradient background
    img = Image.new("RGB", size, color="#3b82f6")

    # Create gradient effect
    draw = ImageDraw.Draw(img)
    width, height = size

    # Simple gradient from blue to darker blue
    for y in range(height):
        alpha = y / height
        r = int(59 * (1 - alpha) + 37 * alpha)
        g = int(130 * (1 - alpha) + 99 * alpha)
        b = int(246 * (1 - alpha) + 235 * alpha)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Add project title
    try:
        font = ImageFont.truetype("arial.ttf", 72)
    except:
        font = ImageFont.load_default()

    text_bbox = draw.textbbox((0, 0), title, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    x = (width - text_width) // 2
    y = (height - text_height) // 2

    # Add text shadow
    draw.text((x + 2, y + 2), title, font=font, fill="#000000", anchor="lt")
    draw.text((x, y), title, font=font, fill="#ffffff", anchor="lt")

    return img


def main():
    """Generate placeholder thumbnails for all projects."""
    projects = [
        ("Amazon Electronics Recommender System", "recommender-thumb.jpg"),
        ("Transformer-Based Sentiment Analysis", "sentiment-bert-thumb.jpg"),
        ("Glaucoma Detection from Retinal Fundus Images", "glaucoma-thumb.jpg"),
    ]

    output_dir = "assets/img/projects"
    os.makedirs(output_dir, exist_ok=True)

    for title, filename in projects:
        img = create_placeholder_thumbnail(title, filename)
        filepath = os.path.join(output_dir, filename)
        img.save(filepath, "JPEG", quality=85, optimize=True)
        print(f"Created {filepath}")


if __name__ == "__main__":
    main()
