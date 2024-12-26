require('dotenv').config();
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { name, email, message } = JSON.parse(event.body);

        if (!name || !email || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'All fields are required.' }),
            };
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: process.env.TARGET_EMAIL,
            subject: `Pesan Baru dari ${name}`,
            text: message,
            html: `<p><strong>Nama:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Pesan:</strong></p><p>${message}</p>`,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Pesan berhasil dikirim!' }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Gagal mengirim pesan.' }),
        };
    }
};
