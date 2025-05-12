const API_URL = 'http://localhost:5000/activate';  // API URL
const API_KEY = 'bd93e7f5-8a7c-41f7-a1f8-427e6f5271cf';                

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
