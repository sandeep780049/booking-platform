import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Script to setup Revolut webhook
async function setupWebhook() {
    try {
        // Replace with your actual webhook URL
        const webhookUrl = 'https://booking-web-vvw8.onrender.com/api/itemBooking/webhook/payment-completed';

        const data = JSON.stringify({
            "url": webhookUrl,
            "events": [
                "ORDER_COMPLETED",
                "ORDER_AUTHORISED"
            ]
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://sandbox-merchant.revolut.com/api/1.0/webhooks',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json', 
                'Authorization': `Bearer ${process.env.REVOLUT_SECRET_API_KEY}`
            },
            data: data
        };

        const response = await axios(config);

        console.log('Webhook setup response:', response.data);
    } catch (error) {
        console.error('Webhook setup error:', error.response?.data || error.message);
    }
}

setupWebhook();
