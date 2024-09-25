import os
import io
import sys
from PIL import Image, ImageFont, ImageDraw
from ultralytics import YOLO, RTDETR


# Get the directory of the current script
base_dir = os.path.dirname(os.path.abspath(__file__))


def process_image(image_path, model_name):
    if model_name == "YOLOv9":
        model_path = os.path.join(base_dir, "models", "best_yolo.pt")
        model = YOLO(model_path)

    elif model_name == "RTDETR":
        model_path = os.path.join(base_dir, "models", "best_rtdetr.pt")
        model = RTDETR(model_path)

    else:
        raise ValueError("Invalid model name")

    # Open the image
    img = Image.open(image_path)
    img_width, img_height = img.size

    # Predict using the model
    results = model.predict(img, conf=0.75, iou=0.5)

    # Extract bounding boxes and confidence scores
    bboxes = results[0].boxes
    draw = ImageDraw.Draw(img)

    # Load a truetype font with the desired size
    base_font_size = 20
    scale_factor = min(img_width, img_height) / 640
    font_size = max(base_font_size, int(base_font_size * scale_factor))

    font_path = os.path.join(base_dir, "fonts", "poppins_medium.ttf")
    font = ImageFont.truetype(font_path, font_size)

    # Define colors for each class
    class_colors = {
        "Bacterial Diseases": (255, 0, 0),
        "Fungal Diseases": (0, 0, 255),
        "Healthy Fish": (0, 255, 0),
        "Parasitic Diseases": (255, 0, 255),
        "White Tail Diseases": (0, 255, 255)
    }

    # Iterate over all detected objects
    for box in enumerate(bboxes):
        # Get coordinates and confidence score
        x1, y1, x2, y2 = box.xyxy[0].tolist()

        # Extract confidence score
        confidence = box.conf[0].item()

        # Get class label
        label = results[0].names[int(box.cls[0].item())]

        # Default color white if the class not found
        color = class_colors.get(label, (255, 255, 255))

        # Draw the bounding box
        draw.rectangle([x1, y1, x2, y2], outline=color, width=3)

        # Prepare label and confidence text
        text = f"{label}: {confidence:.2f}"

        # Calculate text size using textbbox
        text_bbox = draw.textbbox((x1, y1), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]

        # Set the text background rectangle
        text_bg = [x1, y1 - text_height, x1 + text_width, y1]
        draw.rectangle(text_bg, fill=color)
        draw.text((x1, y1 - text_height), text, fill=(255, 255, 255), font=font)

    processed_image = io.BytesIO()
    img.save(processed_image, format="JPEG")
    processed_image.seek(0)

    return processed_image


if __name__ == "__main__":
    image_path = sys.argv[1]
    model_name = sys.argv[2]
    output_path = sys.argv[3]

    output_image = process_image(image_path, model_name)
    with open(output_path, "wb") as f:
        f.write(output_image.read())
