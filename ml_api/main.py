from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ExifTags
import pandas as pd
import numpy as np
import io
import base64
import time
import math
from scipy.special import softmax
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image as keras_image
from config import Config

config = Config()

app = Flask(__name__)
CORS(app)

# ====== โหลดโมเดล classification ======
model_classification_path = config.MODEL_PATH
model_classification = load_model(model_classification_path)
print(f"✅ Loaded model from {model_classification_path}")

all_class_names = [
    'D. Alata', 'D. Bulbifera', 'D. Communis', 'D. Cirrhosa',
    'D. Oppositifolia', 'D. Polystachya', 'D. Transversa', 'D. Villosa',
    'Rolling Wild yam', 'Tiger Hand yam', 'Bird Blood yam', 'Tender Tuber'
]
confidence_threshold = 0.3
# ====== โหลดโมเดล Filter ==============
data = {
    "Species": all_class_names,
    "Phyllotaxy": ["Oppositee", "Alternate", "Alternate", "Oppositee", "Oppositee", "Oppositee", "Alternate", "Whorl", "Alternate", "Oppositee", "Oppositee", "Alternate"],
    "Stem_Type": ["Winged_stem", "Winged_stem", "Winged_stem", "No_Winged_stem", "No_Winged_stem", "Winged_stem", "No_Winged_stem", "No_Winged_stem", "No_Winged_stem", "Winged_stem", "Winged_stem", "No_Winged_stem"],
    "Stem_Color": ["Green", "Green", "Green", "Green", "Purple", "Green", "Green", "Green", "Purple", "Green", "Green", "Green"],
    "Thorns": ["No_Thorns", "No_Thorns", "Has_Thorns", "No_Thorns", "No_Thorns", "No_Thorns", "No_Thorns", "No_Thorns", "No_Thorns", "No_Thorns", "No_Thorns", "Has_Thorns"],
    "Aerial_tuber": ["No_aerial_tuber", "Have_aerial_tuber", "No_aerial_tuber", "No_aerial_tuber", "No_aerial_tuber", "Have_aerial_tuber", "No_aerial_tuber", "No_aerial_tuber", "Have_aerial_tuber", "No_aerial_tuber", "No_aerial_tuber", "No_aerial_tuber"],
    "Petiolar_base_color": ["Purple", "Purple", "Green", "Green", "Green", "Purple", "Purple", "Green", "Purple", "Purple", "Purple", "Green"],
    "Petiole_color": ["Green", "Green", "Green", "Green", "Purple", "Green", "Green", "Green", "Purple", "Green", "Green", "Green"],
    "Petiole_apex_color": ["Purple", "Green", "Green", "Green", "Purple", "Purple", "Green", "Green", "Purple", "Purple", "Green", "Green"],
    "Color_leaf_base_spots": ["Green", "Green", "Green", "Green", "Green", "Purple", "Green", "Green", "Green", "Purple", "Green", "Green"]
}

df = pd.DataFrame(data)

# ---------- ฟังก์ชันกรองพันธุ์ ----------


def filter_species(**filters):
    filtered_df = df.copy()
    active_filters = {k: v for k, v in filters.items() if v and v.strip()}

    if not active_filters:
        return df[["Species"]]

    conditions = []
    for key, value in active_filters.items():
        if key in df.columns:
            condition = df[key] == value
            conditions.append(condition)
            print(f"Condition for {key}={value}: {condition.sum()} matches")

    if not conditions:
        return df[["Species"]]

    combined_condition = conditions[0]
    for cond in conditions[1:]:
        combined_condition &= cond

    result_df = df[combined_condition]

    if result_df.empty:
        print("No matches found for filters. Returning all species.")
        return df[["Species"]]

    return result_df[["Species"]]


# ====== ฟังก์ชันช่วย ======


def get_exif_data(image_pil):
    exif_data = {}
    try:
        info = image_pil._getexif()
        if info:
            for tag, value in info.items():
                tag_name = ExifTags.TAGS.get(tag, tag)
                exif_data[tag_name] = value
    except:
        pass
    return exif_data


def get_gps_info(gps_data):
    gps_info = {}
    for key in gps_data.keys():
        decode = ExifTags.GPSTAGS.get(key, key)
        gps_info[decode] = gps_data[key]
    return gps_info


def dms_to_decimal(dms, ref):
    degrees, minutes, seconds = dms
    decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
    if ref in ['S', 'W']:
        decimal *= -1
    return decimal


def convert_to_jsonable(obj):
    if isinstance(obj, (np.floating, np.integer)):
        return obj.item()
    elif isinstance(obj, (np.ndarray, pd.Series, list, tuple)):
        return [convert_to_jsonable(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_to_jsonable(v) for k, v in obj.items()}
    elif isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj
    else:
        return str(obj)

# ====== Route หลัก ======


@app.route('/predict', methods=['POST'])
def predict():
    try:
        start_time = time.time()

        request_data = request.get_json()

        if not data:
            return jsonify({"error": "Invalid JSON"}), 400

        base64_image = request_data['image']

        user_filters = {
            "Phyllotaxy": request_data.get('Phyllotaxy', ''),
            "Stem_Type": request_data.get('Stem_Type', ''),
            "Stem_Color": request_data.get('Stem_Color', ''),
            "Thorns": request_data.get('Thorns', ''),
            "Aerial_tuber": request_data.get('Aerial_Tuber', ''),
            "Petiolar_base_color": request_data.get('Petiolar_base_color', ''),
            "Petiole_color": request_data.get('Petiole_color', ''),
            "Petiole_apex_color": request_data.get('Petiole_apex_color', ''),
            "Color_leaf_base_spots": request_data.get('Color_leaf_base', '')
        }
        print("Processed filters:", user_filters)

        filtered_species = filter_species(**user_filters)
        filtered_class_names = filtered_species["Species"]

        print("filtered_class_names =", filtered_class_names.tolist())

        # decode และแปลงเป็น PIL Image
        image_data = base64.b64decode(base64_image)

        # 🔁 สร้าง stream ใหม่สำหรับ EXIF
        image_stream_exif = io.BytesIO(image_data)
        image_nocenvert = Image.open(image_stream_exif)

        # 🔁 สร้าง stream ใหม่สำหรับโมเดล
        image_stream_model = io.BytesIO(image_data)
        image_pil = Image.open(image_stream_model).convert("RGB")

        # ===== EXIF Info =====
        exif = get_exif_data(image_nocenvert)
        print("EXIF Data:", exif)
        datetime_taken = (
            exif.get('DateTimeOriginal') or
            exif.get('DateTime') or
            exif.get('GPSDateStamp') or
            ''
        )

        def is_valid_gps_tuple(t):
            return t and all(isinstance(x, (int, float)) and not math.isnan(x) for x in t)

        gps_info = exif.get('GPSInfo', None)
        gps_decimal = {'latitude': "", 'longitude': ""}

        lat_tuple = None
        lon_tuple = None
        gps_data = {}

        if gps_info:
            gps_data = get_gps_info(gps_info)
            lat_tuple = gps_data.get('GPSLatitude')
            lon_tuple = gps_data.get('GPSLongitude')

        if is_valid_gps_tuple(lat_tuple) and is_valid_gps_tuple(lon_tuple):
            lat = dms_to_decimal(
                lat_tuple, gps_data.get('GPSLatitudeRef', 'N'))
            lon = dms_to_decimal(
                lon_tuple, gps_data.get('GPSLongitudeRef', 'E'))
            gps_decimal = {'latitude': lat, 'longitude': lon}
        else:
            gps_decimal = {'latitude': "", 'longitude': ""}

        # ===== Prediction =====
        img_resized = image_pil.resize((256, 256))
        img_array = keras_image.img_to_array(img_resized) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        pred = model_classification.predict(img_array).flatten()

        print("🔎 Matched Species from Filters:")
        if not filtered_class_names.empty:
            for species in filtered_class_names:
                print(f"- {species}")
        else:
            print("⚠️ ไม่มีสายพันธุ์ที่ตรงกับเงื่อนไข filter.")
            return jsonify({
                "error": "⚠️ ไม่มีสายพันธุ์ที่ตรงกับเงื่อนไข filter."
            }), 400

        # ---------- แสดง Top 5 Prediction ----------
        top_k = min(len(all_class_names), len(pred), 5)
        top_5_indices = np.argsort(pred)[::-1][:top_k]
        top_5_species = list(zip(
            [all_class_names[i] for i in top_5_indices],
            [pred[i] * 100 for i in top_5_indices]
        ))

        print("\n📈 Top 5 Predictions by Model:")
        for i, (species, conf) in enumerate(top_5_species, start=1):
            print(f"{i}. {species}: {conf:.2f}%")

        # ---------- ทำนายในกลุ่มที่ผ่านฟิลเตอร์ ----------
        filtered_class_names_list = filtered_class_names.tolist()
        filtered_indices = [all_class_names.index(
            cls) for cls in filtered_class_names_list]
        filtered_preds = pred[filtered_indices]

        if len(filtered_preds) == 0:
            return jsonify({
                "error": "ไม่สามารถทำนายได้ เพราะไม่มีข้อมูลหลังการกรอง"
            }), 400

        filtered_preds_normalized = softmax(filtered_preds)
        predicted_index_in_filtered = np.argmax(filtered_preds_normalized)

        # ตรวจสอบ index ป้องกัน out-of-bound
        if predicted_index_in_filtered >= len(filtered_class_names_list):
            return jsonify({
                "error": f"Prediction index {predicted_index_in_filtered} out of bounds for filtered list size {len(filtered_class_names_list)}"
            }), 500

        predicted_label = filtered_class_names_list[predicted_index_in_filtered]
        print(f"\n: {filtered_preds_normalized[predicted_index_in_filtered]}")
        confidence = filtered_preds_normalized[predicted_index_in_filtered] * 100

        print("\n✅ Most confident match from filtered classes:")
        print(
            f"Prediction: {predicted_label} with confidence: {confidence:.2f}%")

        # ---------- เก็บค่าความน่าจะเป็นของทุกคลาส ----------
        all_predictions_dict = {
            all_class_names[i]: float(pred[i]) * 100
            for i in range(len(all_class_names))
        }

        end_time = time.time()
        time_process = round((end_time - start_time) * 1000, 2)

        result = {
            "filtered_prediction": {
                "label": predicted_label,
                "confidence": float(confidence)
            },
            "top5_predictions": top_5_species,
            "filtered_species_list": filtered_class_names,
            "all_class_probabilities": all_predictions_dict,
            'datetime_taken': datetime_taken,
            'gps': gps_decimal,
            'process_time': time_process,
        }
        json_ready_result = convert_to_jsonable(result)

        print(f"result: {json_ready_result}")

        return jsonify(json_ready_result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": model_classification is not None,
        "timestamp": time.time()
    })


# ====== Run (เฉพาะทดสอบ local) ======
if __name__ == '__main__':
    app.run(debug=config.DEBUG, port=config.PORT)
