require('dotenv').config(); // Tải biến môi trường từ .env
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express(); 

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Sử dụng biến môi trường

app.use(cors());
app.use(express.json());

app.post('/payment-sheet', async (req, res) => {
    try {
        // Tạo Customer (tùy chọn, nếu bạn muốn lưu thông tin khách hàng)
        const customer = await stripe.customers.create({
            email: req.body.email || 'customer@example.com',
        });

        // Tạo Ephemeral Key (tùy chọn, nếu sử dụng Customer)
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2023-10-16' }
        );

        // Tạo PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 59900000, // 599.000₫ (số tiền tính bằng cent)
            currency: 'vnd',
            customer: customer.id,
            automatic_payment_methods: { enabled: true },
        });

        res.json({
            paymentIntent: paymentIntent.client_secret,
            customer: customer.id,
            ephemeralKey: ephemeralKey.secret,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY, // Sử dụng biến môi trường
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));