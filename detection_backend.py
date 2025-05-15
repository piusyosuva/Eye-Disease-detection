
import os
import cv2
import numpy as np
from flask import Flask, request, jsonify
from threading import Thread
from tensorflow.keras.preprocessing.image import ImageDataGenerator, img_to_array
from tensorflow.keras.applications import VGG16
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Flatten, Dropout
from tensorflow.keras.optimizers import Adam

# -------------------------------
# Class labels (only cataract)
# -------------------------------
class_names = ['cataract']

# -------------------------------
# Load and Prepare Dataset
# -------------------------------
print("[INFO] Preparing dataset...")

data_dir = r"archive (1)\processed_images\test"
img_size = (224, 224)
batch_size = 16

datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

train_data = datagen.flow_from_directory(
    data_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='binary',
    subset='training',
    shuffle=True
)

val_data = datagen.flow_from_directory(
    data_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='binary',
    subset='validation'
)

# -------------------------------
# Build Model
# -------------------------------
print("[INFO] Loading VGG16 base model...")
base_model = VGG16(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

for layer in base_model.layers:
    layer.trainable = False

x = base_model.output
x = Flatten()(x)
x = Dense(64, activation='relu')(x)
x = Dropout(0.5)(x)
predictions = Dense(1, activation='sigmoid')(x)

model = Model(inputs=base_model.input, outputs=predictions)
model.compile(optimizer=Adam(learning_rate=0.0001), loss='binary_crossentropy', metrics=['accuracy'])

print("[INFO] Training model...")
model.fit(
    train_data,
    validation_data=val_data,
    epochs=5
)

print("[INFO] Training complete.")

# -------------------------------
# Real-Time Detection Function
# -------------------------------
def start_detection():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Could not open webcam.")
        return

    print("[INFO] Real-time detection started via API trigger.")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] Failed to grab frame.")
            break

        resized = cv2.resize(frame, img_size)
        image_array = img_to_array(resized)
        image_array = np.expand_dims(image_array, axis=0) / 255.0

        preds = model.predict(image_array)[0][0]
        label = "Cataract" if preds >= 0.5 else "No Cataract"
        confidence = preds

        output = cv2.resize(frame, (640, 480))
        cv2.putText(output, f"{label} ({confidence:.2f})", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.imshow("Cataract Detection", output)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# -------------------------------
# Flask API for Remote Trigger
# -------------------------------
VALID_API_KEY = "bd93e7f5-8a7c-41f7-a1f8-427e6f5271cf"  
app = Flask(__name__)
detection_running = False

@app.route('/activate', methods=['POST'])
def activate_detection():
    global detection_running
    data = request.get_json()
    if not data or data.get('api_key') != VALID_API_KEY:
        return jsonify({'status': 'error', 'message': 'Invalid API key'}), 401

    if detection_running:
        return jsonify({'status': 'running', 'message': 'Detection already in progress'}), 200

    # Start detection in a separate thread
    detection_running = True
    Thread(target=start_detection).start()
    return jsonify({'status': 'success', 'message': 'Cataract detection started'}), 200

if __name__ == '__main__':
    print("[INFO] Waiting for remote activation using API key...")
    app.run(host='0.0.0.0', port=5000)

