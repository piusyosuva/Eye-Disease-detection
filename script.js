const API_URL = 'https://your-api-url.com/predict';  // Replace with your API URL
const API_KEY = 'your_api_key_here';                 // Replace with your API key

async function submitImage() {
  const input = document.getElementById('imageInput');
  const result = document.getElementById('result');
  const file = input.files[0];

  if (!file) {
    result.textContent = "Please select an image.";
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  result.textContent = "Analyzing...";

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      body: formData
    });

    if (!response.ok) throw new Error("Failed to get prediction.");

    const data = await response.json();
    result.textContent = `Prediction: ${data.prediction || "Unknown result"}`;
  } catch (err) {
    console.error(err);
    result.textContent = "Error analyzing image. Try again.";
  }
}
