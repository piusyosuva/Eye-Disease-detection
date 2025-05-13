<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eye Disease Detection System</title>
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
        
        .upload-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            border: 2px dashed var(--primary-green);
            border-radius: 10px;
            background-color: var(--light-green);
            transition: all 0.3s ease;
        }
        
        .upload-container:hover {
            background-color: #e0f5ed;
        }
        
        .upload-container p {
            margin: 15px 0;
            font-size: 16px;
        }
        
        .file-input-wrapper {
            position: relative;
            margin: 20px 0;
        }
        
        .file-input {
            display: none;
        }
        
        .file-label {
            background-color: var(--primary-green);
            color: var(--white);
            padding: 12px 25px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        
        .file-label:hover {
            background-color: var(--dark-green);
        }
        
        .selected-file-name {
            margin-top: 10px;
            font-style: italic;
        }
        
        .submit-btn {
            background-color: var(--primary-green);
            color: var(--white);
            border: none;
            padding: 12px 25px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
            transition: background-color 0.3s ease;
        }
        
        .submit-btn:hover {
            background-color: var(--dark-green);
        }
        
        .submit-btn:disabled {
            background-color: #95e6bb;
            cursor: not-allowed;
        }
        
        .results-container {
            margin-top: 30px;
            display: none;
            text-align: center;
        }
        
        .results-header {
            font-size: 22px;
            margin-bottom: 15px;
            color: var(--dark-green);
        }
        
        .results-content {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .results-box {
            width: 100%;
            padding: 20px;
            border-radius: 10px;
            margin-top: 15px;
            text-align: center;
        }
        
        .positive-result {
            background-color: #fde8e8;
            border: 1px solid #f56565;
            color: #c53030;
        }
        
        .negative-result {
            background-color: #e8f8f0;
            border: 1px solid var(--primary-green);
            color: var(--dark-green);
        }
        
        .preview-container {
            margin-top: 20px;
            width: 300px;
            height: 200px;
            border: 1px solid #ccc;
            border-radius: 5px;
            overflow: hidden;
            display: none;
        }
        
        .preview-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        .loader {
            border: 5px solid var(--light-green);
            border-top: 5px solid var(--primary-green);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
            display: none;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .disease-details {
            margin-top: 20px;
            padding: 15px;
            background-color: var(--light-gray);
            border-radius: 5px;
            text-align: left;
        }
        
        .error-message {
            color: #e53e3e;
            margin-top: 10px;
            text-align: center;
            display: none;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Eye Disease Detection System</h1>
            <p>Upload a photo of your eyes for AI-powered disease detection</p>
        </header>
        
        <div class="main-content">
            <div class="upload-container">
                <h2>Upload Eye Image</h2>
                <p>Please upload a clear, well-lit photo of your eye for the most accurate diagnosis</p>
                
                <div class="preview-container">
                    <img id="image-preview" alt="Eye image preview">
                </div>
                
                <div class="file-input-wrapper">
                    <input type="file" id="eye-image" class="file-input" accept="image/*">
                    <label for="eye-image" class="file-label">Select Image</label>
                    <div class="selected-file-name" id="file-name"></div>
                </div>
                
                <button id="submit-btn" class="submit-btn" disabled>Analyze Image</button>
                <div class="error-message" id="error-message"></div>
            </div>
            
            <div class="loader" id="loader"></div>
            
            <div class="results-container" id="results-container">
                <h3 class="results-header">Analysis Results</h3>
                <div class="results-content">
                    <div id="results-box" class="results-box">
                        <p id="result-text">Processing your image...</p>
                    </div>
                    <div class="disease-details" id="disease-details">
                        <h4 id="disease-name"></h4>
                        <p id="disease-description"></p>
                        <p id="next-steps"></p>
                    </div>
                </div>
            </div>
        </div>
        
        <footer>
            <p>This tool is for informational purposes only and should not replace professional medical advice.</p>
            <p>Always consult with an ophthalmologist for proper diagnosis and treatment.</p>
        </footer>
    </div>
    
    <script>
        // DOM Elements
        const fileInput = document.getElementById('eye-image');
        const fileNameDisplay = document.getElementById('file-name');
        const submitBtn = document.getElementById('submit-btn');
        const imagePreview = document.getElementById('image-preview');
        const previewContainer = document.querySelector('.preview-container');
        const resultsContainer = document.getElementById('results-container');
        const loader = document.getElementById('loader');
        const resultBox = document.getElementById('results-box');
        const resultText = document.getElementById('result-text');
        const errorMessage = document.getElementById('error-message');
        const diseaseDetails = document.getElementById('disease-details');
        const diseaseName = document.getElementById('disease-name');
        const diseaseDescription = document.getElementById('disease-description');
        const nextSteps = document.getElementById('next-steps');
        
        // API Configuration
        const API_URL = "http://localhost:5000/activate"; // Local API endpoint
        const API_KEY = "bd93e7f5-8a7c-41f7-a1f8-427e6f5271cf"; // API key for authentication
        
        // File input change event
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            
            if (file) {
                // Display file name
                fileNameDisplay.textContent = file.name;
                
                // Enable submit button
                submitBtn.disabled = false;
                
                // Show image preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
                
                // Clear any previous error messages
                errorMessage.style.display = 'none';
            } else {
                fileNameDisplay.textContent = '';
                submitBtn.disabled = true;
                previewContainer.style.display = 'none';
            }
        });
        
        // Submit button click event
        submitBtn.addEventListener('click', async function() {
            const file = fileInput.files[0];
            
            if (!file) {
                displayError("Please select an image file.");
                return;
            }
            
            try {
                // Show loader and hide results
                loader.style.display = 'block';
                resultsContainer.style.display = 'none';
                errorMessage.style.display = 'none';
                submitBtn.disabled = true;
                
                // Prepare form data
                const formData = new FormData();
                formData.append('image', file);
                
                // Make API request
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Process and display results
                displayResults(data);
            } catch (error) {
                console.error("Error:", error);
                displayError("An error occurred while analyzing the image. Please try again.");
            } finally {
                loader.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
        
        // Display results function
        function displayResults(data) {
            // Show results container
            resultsContainer.style.display = 'block';
            
            // Example data structure (modify according to your actual API response)
            // data = {
            //     disease_detected: true,
            //     disease_name: "Diabetic Retinopathy",
            //     confidence: 0.89,
            //     description: "Diabetic retinopathy is a diabetes complication that affects eyes.",
            //     recommendations: "Schedule an appointment with an ophthalmologist for a comprehensive evaluation."
            // }
            
            // Display basic result
            if (data.disease_detected) {
                resultBox.className = 'results-box positive-result';
                resultText.innerHTML = `<strong>Disease Detected:</strong> ${data.disease_name} (${Math.round(data.confidence * 100)}% confidence)`;
                
                // Display disease details
                diseaseName.textContent = data.disease_name;
                diseaseDescription.textContent = data.description || "No additional information available.";
                nextSteps.textContent = `Recommended Next Steps: ${data.recommendations || "Consult with an ophthalmologist."}`;
                diseaseDetails.style.display = 'block';
            } else {
                resultBox.className = 'results-box negative-result';
                resultText.innerHTML = "<strong>No Disease Detected</strong>";
                diseaseDetails.style.display = 'none';
            }
        }
        
        // Display error function
        function displayError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    </script>
</body>
</html>
