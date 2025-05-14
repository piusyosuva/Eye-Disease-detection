from flask import Flask, Response, render_template_string
import cv2
import numpy as np
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.applications import VGG16
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Flatten, Dropout
from tensorflow.keras.optimizers import Adam

app = Flask(_name_)

# -----------------------------
# Load VGG16-Based Model
# -----------------------------
img_size = (224, 224)
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

# -----------------------------
# Video Capture Setup
# -----------------------------
camera = cv2.VideoCapture(0)

# -----------------------------
# HTML Template as String
# -----------------------------
html_template = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Real-Time Cataract Detection</title>
    <style>
        :root {
            --primary-green: #2ecc71;
            --dark-green: #27ae60;
            --light-green: #e8f8f0;
            --white: #ffffff;
            --light-gray: #f5f5f5;
            --text-dark: #333333;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: var(--light-green);
            color: var(--text-dark);
            line-height: 1.6;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }

        header {
            background-color: var(--primary-green);
            color: var(--white);
            padding: 20px 0;
            text-align: center;
            border-radius: 10px 10px 0 0;
            margin-top: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        header h1 {
            margin-bottom: 10px;
        }

        .main-content {
            background-color: var(--white);
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .video-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            border: 2px dashed var(--primary-green);
            border-radius: 10px;
            background-color: var(--light-green);
            transition: all 0.3s ease;
        }

        .video-container:hover {
            background-color: #e0f5ed;
        }

        .video-container img {
            width: 640px;
            height: 480px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        footer {
            text-align: center;
            margin-top: 30px;
            color: var(--text-dark);
            font-size: 14px;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }

            .main-content {
                padding: 20px;
            }

            .video-container img {
                width: 100%;
                height: auto;
            }
        }

        #startBtn {
            background-color: var(--primary-green);
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }

        #startBtn:disabled {
            background-color: #bdc3c7;
            cursor: not-allowed;
        }

    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Real-Time Cataract Detection</h1>
            <p>Live video analysis using AI-powered VGG16 model</p>
        </header>

        <div class="main-content">
            <button id="startBtn" onclick="startDetection()">Start Detection</button>
            <div class="video-container" id="videoContainer" style="display:none;">
                <img src="{{ url_for('video_feed') }}" alt="Live Video Feed">
            </div>
        </div>

        <footer>
            <p>This tool is for informational purposes only and should not replace professional medical advice.</p>
            <p>Always consult with an ophthalmologist for proper diagnosis and treatment.</p>
        </footer>
    </div>

    <script>
        function startDetection() {
            document.getElementById('startBtn').disabled = true;
            document.getElementById('videoContainer').style.display = 'block';
        }
    </script>
</body>
</html>
'''

# -----------------------------
# Video Streaming Route
# -----------------------------
def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break

        # Preprocess for prediction
        resized = cv2.resize(frame, img_size)
        image_array = img_to_array(resized)
        image_array = np.expand_dims(image_array, axis=0) / 255.0

        preds = model.predict(image_array)[0][0]
        label = "Cataract" if preds >= 0.5 else "No Cataract"
        confidence = f"{preds:.2f}"

        # Overlay prediction on frame
        cv2.putText(frame, f"{label} ({confidence})", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if label == "Cataract" else (0, 0, 255), 2)

        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return render_template_string(html_template)

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# -----------------------------
# Start the Flask App
# -----------------------------
if _name_ == '_main_':
    app.run(debug=True)
