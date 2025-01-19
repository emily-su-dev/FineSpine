const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Middleware to parse JSON data
app.use(express.json());

// Set up your Cohere API key
const API_KEY = 'your_cohere_api_key';

// Endpoint to get posture advice
app.post('/getPostureAdvice', async (req, res) => {
    const postureData = req.body;  // Assume posture data is sent from frontend

    try {
        const response = await axios.post(
            'https://api.cohere.ai/v1/generate',
            {
                prompt: `Generate actionable advice for improving posture and reducing back pain. The posture data is: ${JSON.stringify(postureData)}`,
                max_tokens: 150,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ advice: response.data.text });
    } catch (error) {
        console.error('Error generating advice:', error);
        res.status(500).send('Error generating advice');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
