require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'website')));

// Rate-Limiting: max 5 Anfragen pro 15 Min pro IP (Spam-Schutz)
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Zu viele Anfragen. Bitte später erneut versuchen.' },
    standardHeaders: true,
    legacyHeaders: false
});

// HTML-Escaping für E-Mail-Inhalte (XSS/Injection in Mails)
function escapeHtml(str) {
    if (str == null || typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// Gmail SMTP – Zugangsdaten aus Umgebungsvariablen (.env)
const emailUser = process.env.GMAIL_USER || '';
const emailPass = process.env.GMAIL_APP_PASSWORD || '';
if (!emailUser || !emailPass) {
    console.warn('Hinweis: GMAIL_USER oder GMAIL_APP_PASSWORD nicht gesetzt. Kontaktformular funktioniert erst nach Konfiguration in .env');
}
const emailConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: emailUser, pass: emailPass }
};
const transporter = nodemailer.createTransport(emailConfig);

app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        const { name, company, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, E-Mail, Betreff und Nachricht sind erforderlich.'
            });
        }

        const subjectLabels = {
            outsourcing: 'IT-Outsourcing',
            ki: 'KI-Integration',
            cloud: 'Cloud-Lösungen',
            support: 'Support & Wartung',
            other: 'Sonstiges'
        };
        const subjectText = subjectLabels[subject] || subject;

        // Für E-Mails: Klartext für Betreff/Text, escaped für HTML
        const nameSafe = escapeHtml(String(name).trim().substring(0, 200));
        const companySafe = escapeHtml(String(company || '').trim().substring(0, 200));
        const emailSafe = escapeHtml(String(email).trim().substring(0, 254));
        const subjectSafe = escapeHtml(subjectText);
        const messageSafe = escapeHtml(String(message).trim().substring(0, 5000)).replace(/\n/g, '<br>');

        if (!emailConfig.auth.user || !emailConfig.auth.pass) {
            return res.status(503).json({
                success: false,
                message: 'E-Mail-Dienst nicht konfiguriert. Bitte GMAIL_USER und GMAIL_APP_PASSWORD in .env setzen.'
            });
        }

        const mailOptions = {
            from: emailConfig.auth.user,
            to: emailUser,
            replyTo: email.trim(),
            subject: `D IT Solution: ${subjectText} – ${String(name).trim()}`,
            html: `
                <h2>Neue Kontaktanfrage</h2>
                <p><strong>Name:</strong> ${nameSafe}</p>
                <p><strong>Unternehmen:</strong> ${companySafe || 'Nicht angegeben'}</p>
                <p><strong>E-Mail:</strong> ${emailSafe}</p>
                <p><strong>Betreff:</strong> ${subjectSafe}</p>
                <hr>
                <p><strong>Nachricht:</strong></p>
                <p>${messageSafe}</p>
            `,
            text: `Name: ${name}\nUnternehmen: ${company || 'Nicht angegeben'}\nE-Mail: ${email}\nBetreff: ${subjectText}\n\nNachricht:\n${message}`
        };

        await transporter.sendMail(mailOptions);
        console.log('E-Mail an', emailConfig.auth.user, 'gesendet');

        // Bestätigungsmail an Absender (Lucentis-Style, angepasst für D IT Solution)
        const confirmationMail = {
            from: `D IT Solution <${emailUser}>`,
            to: email.trim(),
            subject: 'Ihre Nachricht wurde erhalten - D IT Solution',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital@0;1&family=Inter:wght@300;400;500;600&display=swap');
                        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background: #fafafa; }
                        .email-wrapper { padding: 20px; }
                        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e5e5e5; }
                        .header { background: #000000; padding: 50px 40px; text-align: center; }
                        .logo-text { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; font-style: italic; color: #ffffff; letter-spacing: 0.08em; margin: 0 0 20px 0; text-transform: uppercase; }
                        .header h1 { color: #ffffff; margin: 0 0 12px 0; font-size: 24px; font-weight: 400; letter-spacing: -0.02em; }
                        .header-subtitle { color: rgba(255, 255, 255, 0.8); margin: 0; font-size: 14px; font-weight: 300; }
                        .content { padding: 45px 40px; }
                        .greeting { font-size: 17px; color: #1a1a1a; margin-bottom: 20px; line-height: 1.8; font-weight: 400; }
                        .message { font-size: 15px; color: #525252; line-height: 1.8; margin: 20px 0; font-weight: 300; }
                        .highlight-box { background: #fafafa; border-left: 3px solid #000000; padding: 22px; margin: 28px 0; border-radius: 0 4px 4px 0; }
                        .highlight-box p { margin: 0; color: #1a1a1a; font-size: 15px; line-height: 1.8; font-weight: 300; }
                        .divider { height: 1px; background: linear-gradient(90deg, transparent 0%, #000 20%, #000 80%, transparent 100%); margin: 35px 0; opacity: 0.12; }
                        .signature { margin-top: 30px; color: #1a1a1a; font-size: 15px; font-weight: 300; }
                        .signature-name { font-weight: 500; margin-top: 10px; color: #000000; }
                        .footer { background: #f5f5f5; padding: 35px 30px; text-align: center; border-top: 1px solid #e5e5e5; }
                        .footer-brand { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 300; font-style: italic; color: #000000; margin-bottom: 6px; letter-spacing: 0.05em; }
                        .footer-tagline { color: #737373; font-size: 13px; margin: 0 0 18px 0; font-weight: 300; }
                        .footer-contact { color: #737373; font-size: 12px; margin: 15px 0 0 0; line-height: 1.6; }
                        .footer-contact a { color: #000000; text-decoration: none; font-weight: 400; }
                        .footer-contact a:hover { text-decoration: underline; }
                        .premium-badge { display: inline-block; padding: 8px 16px; background: #000000; color: #ffffff; border-radius: 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 500; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="email-wrapper">
                        <div class="container">
                            <div class="header">
                                <div class="logo-text">D IT Solution</div>
                                <h1>Vielen Dank für Ihre Nachricht</h1>
                                <p class="header-subtitle">Ihre Nachricht wurde erfolgreich übermittelt</p>
                            </div>
                            <div class="content">
                                <div class="greeting">Hallo ${nameSafe},</div>
                                <div class="message">
                                    vielen Dank, dass Sie Kontakt mit uns aufgenommen haben. Wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.
                                </div>
                                <div class="highlight-box">
                                    <p>Unser Team bearbeitet Ihre Anfrage mit höchster Priorität und wird sich innerhalb der nächsten 24 Stunden bei Ihnen melden.</p>
                                </div>
                                <div class="divider"></div>
                                <div class="signature">
                                    <p>Mit freundlichen Grüßen,</p>
                                    <p class="signature-name">Ihr Team von D IT Solution</p>
                                </div>
                            </div>
                            <div class="footer">
                                <div class="footer-brand">D IT Solution</div>
                                <p class="footer-tagline">Professionelles IT-Outsourcing & moderne Technologien</p>
                                <div class="footer-contact">
                                    <a href="mailto:info@ditsolution.de">info@ditsolution.de</a><br>
                                    © 2026 D IT Solution
                                </div>
                                <div class="premium-badge">IT-Outsourcing</div>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Vielen Dank für Ihre Nachricht

Hallo ${name},

vielen Dank, dass Sie Kontakt mit uns aufgenommen haben. Wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.

Unser Team bearbeitet Ihre Anfrage mit höchster Priorität und wird sich innerhalb der nächsten 24 Stunden bei Ihnen melden.

Mit freundlichen Grüßen,
Ihr Team von D IT Solution

---
D IT Solution
Professionelles IT-Outsourcing & moderne Technologien
info@ditsolution.de
© 2026 D IT Solution
            `
        };

        await transporter.sendMail(confirmationMail);
        console.log('Bestätigungsmail an', email, 'gesendet');

        res.json({ success: true, message: 'Nachricht erfolgreich gesendet.' });
    } catch (error) {
        console.error('Kontaktformular Fehler:', error);
        console.error('Details:', error.message);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Senden. Bitte später erneut versuchen.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`D IT Solution Backend läuft auf http://localhost:${PORT}`);
    console.log(`Website: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api/contact`);
});
