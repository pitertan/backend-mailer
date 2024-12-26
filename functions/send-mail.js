require('dotenv').config();
const nodemailer = require('nodemailer');

// CORS Headers
const setHeaders = {
    "Access-Control-Allow-Origin": "*", // Mengizinkan akses dari semua domain
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET", // Mengizinkan metode HTTP yang digunakan
    "Access-Control-Allow-Headers": "Content-Type", // Mengizinkan header Content-Type
};

exports.handler = async (event) => {
    // Menangani permintaan OPTIONS (untuk preflight request)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: setHeaders,
            body: JSON.stringify({ message: 'CORS allowed' }),
        };
    }

    // Menangani permintaan POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: setHeaders,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { name, email, message } = JSON.parse(event.body);

        if (!name || !email || !message) {
            return {
                statusCode: 400,
                headers: setHeaders,
                body: JSON.stringify({ error: 'All fields are required.' }),
            };
        }

        // Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // false untuk port selain 465
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Mengirim email
        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: process.env.TARGET_EMAIL,
            subject: `Pesan Baru dari ${name}`,
            text: message,
            html: `<p><strong>Nama:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Pesan:</strong></p><p>${message}</p>`,
        });

        return {
            statusCode: 200,
            headers: setHeaders,
            body: JSON.stringify({ message: 'Pesan berhasil dikirim!' }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: setHeaders,
            body: JSON.stringify({ error: 'Gagal mengirim pesan.' }),
        };
    }
};
