const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #20b2aa; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">MedService Clinic</h1>
          <p style="color: #e0f2f1; margin: 5px 0 0; font-size: 14px;">MEDICAL & SKIN CLINIC</p>
        </div>
        <div style="padding: 40px; background-color: #ffffff;">
          <h2 style="color: #333; margin-top: 0;">Appointment Confirmation</h2>
          <p style="color: #555; line-height: 1.6;">Dear <strong>${options.name}</strong>,</p>
          <p style="color: #555; line-height: 1.6;">Thank you for choosing MedService Clinic. Your appointment has been successfully booked. Here are the details:</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #777; width: 120px;">Date:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${options.date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #777;">Patient Name:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${options.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #777;">Phone:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">${options.phone}</td>
              </tr>
            </table>
          </div>

          <p style="color: #555; line-height: 1.6;"><strong>Message from Clinic:</strong><br>${options.message || 'We look forward to seeing you. Please arrive 15 minutes early.'}</p>
          
          <p style="color: #555; line-height: 1.6; margin-top: 30px;">If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.</p>
          
          <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px;">&copy; 2026 MedService Clinic. All rights reserved.</p>
            <p style="color: #999; font-size: 12px;">123 Health Street, Medical District, Clinic City</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
