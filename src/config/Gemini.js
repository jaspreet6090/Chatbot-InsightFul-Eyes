

// node --version # Should be >= 18
// npm install @google/generative-ai

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = "AIzaSyAXJGHWCDCE9OADfh_qCQpHm3iiLhVKeC8";

// async function runChat(prompt) {
//   const genAI = new GoogleGenerativeAI(API_KEY);
//   const model = genAI.getGenerativeModel({ model: MODEL_NAME });

//   const generationConfig = {
//     temperature: 0.7,
//     topK: 1,
//     topP: 1,
//     maxOutputTokens: 150,
//   };

//   const safetySettings = [
//     {
//       category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//     },
//     {
//       category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//     },
//     {
//       category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//     },
//     {
//       category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//     },
//   ];

//   const chat = model.startChat({
//     generationConfig,
//     safetySettings,
//     history: [
//     ],
//   });

//   const result = await chat.sendMessage(prompt);
//   const response = result.response;
//   console.log(response.text());
//   return response.text();
// }


async function runChat(prompt, imageFile = null) {
    let fastAPIEndpoint;

    // Determine the endpoint based on the presence of an image file
    if (imageFile) {
        fastAPIEndpoint = "http://127.0.0.1:8888/ImageOverview"; // Endpoint for image processing
    } else {
        fastAPIEndpoint = "http://127.0.0.1:8000/TextOverview"; // Endpoint for text processing
    }

    const formData = new FormData(); // Use FormData to handle both text and file uploads
    formData.append("prompt", prompt); // Add the prompt to the form data

    // If an image file is provided, append it to the form data
    if (imageFile) {
        formData.append("image_file", imageFile); // Add the image file
    }

    // Make a POST request to the determined FastAPI endpoint
    const response = await fetch(fastAPIEndpoint, {
        method: "POST",
        body: formData, // Send the form data
    });

    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText); // Log the error response
        throw new Error("Network response was not ok: " + errorText);
    }

    // Parse the JSON response
    const data = await response.json();

    // Log and return the response text
    console.log(data.response_text);
    return data.response_text;
}

export default runChat;