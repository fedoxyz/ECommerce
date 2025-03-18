import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com';
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

async function getAccessToken() {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    try {
        const response = await axios.post(
            `${PAYPAL_API_BASE}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching PayPal access token:', error.response?.data || error.message);
        throw error;
    }
}

async function createOrder(amount, currency = 'USD') {
    const accessToken = await getAccessToken();
    
    const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: currency,
                    value: amount,
                },
            },
        ],
    };

    try {
        const response = await axios.post(
            `${PAYPAL_API_BASE}/v2/checkout/orders`,
            orderData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating PayPal order:', error.response?.data || error.message);
        throw error;
    }
}

export { getAccessToken, createOrder };
