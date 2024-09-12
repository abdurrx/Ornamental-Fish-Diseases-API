import os
import io
import sys
from PIL import Image, ImageFont, ImageDraw
from ultralytics import YOLO, RTDETR


# Get the directory of the current script
base_dir = os.path.dirname(os.path.abspath(__file__))


def calculate_iou(box1, box2):
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    intersection = max(0, x2 - x1) * max(0, y2 - y1)
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])

    union = area1 + area2 - intersection
    return intersection / union if union > 0 else 0


def is_overlapping(box, final_boxes, iou_threshold):
    for fbox in final_boxes:
        iou = calculate_iou(box, fbox)
        if iou > iou_threshold:
            return True
    return False


def non_max_suppression(boxes, iou_threshold=0.5):
    final_boxes = []
    for box in boxes:
        if not is_overlapping(box, final_boxes, iou_threshold):
            final_boxes.append(box)
    return final_boxes


def convert_boxes_to_list(boxes, model_results):
    box_list = []
    for box in boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        confidence = box.conf[0].item()
        label = model_results.names[int(box.cls[0].item())]
        box_list.append([x1, y1, x2, y2, confidence, label])
    return box_list


def process_image_ensemble(image_path, model_name):
    if model_name == "YOLOv9+RTDETR":
        yolo_model_path = os.path.join(base_dir, "models", "best_yolo.pt")
        rtdetr_model_path = os.path.join(base_dir, "models", "best_rtdetr.pt")

        yolo_model = YOLO(yolo_model_path)
        rtdetr_model = RTDETR(rtdetr_model_path)

    else:
        raise ValueError("Invalid model name")

    # Open the image
    img = Image.open(image_path).convert('RGB')
    img_width, img_height = img.size

    # Predict using YOLOv9
    yolo_results = yolo_model.predict(img, conf=0.75, iou=0.5)
    yolo_bboxes = convert_boxes_to_list(yolo_results[0].boxes, yolo_results[0])

    # Predict using RT-DETR
    rtdetr_results = rtdetr_model.predict(img, conf=0.75, iou=0.5)
    rtdetr_bboxes = convert_boxes_to_list(rtdetr_results[0].boxes, rtdetr_results[0])

    # Combine both results
    combined_bboxes = yolo_bboxes + rtdetr_bboxes

    # Apply Non-Maximum Suppression (NMS) to filter overlapping boxes
    final_bboxes = non_max_suppression(combined_bboxes, iou_threshold=0.5)

    # Draw bounding boxes on the image
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

    # Iterate over all final bounding boxes
    for box in final_bboxes:
        x1, y1, x2, y2, confidence, label = box

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

    output_image = process_image_ensemble(image_path, model_name)
    with open(output_path, "wb") as f:
        f.write(output_image.read())
