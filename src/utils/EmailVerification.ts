import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email: string, link: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
        <div style="background: #1e3c72; padding: 20px; text-align: center;">
          <img src="https://escrowsocials.com/logo.png" alt="EscrowSocials" style="height: 50px;" />
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1e3c72;">Verify Your Email Address</h2>
          <p style="font-size: 16px; color: #555;">
            Thanks for signing up with <strong>EscrowSocials</strong>! Please confirm your email address to get started and protect your deals.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #00b67a; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 6px;">
              Verify Email
            </a>
          </div>
          <p style="font-size: 14px; color: #777;">
            If you didn’t create an account with EscrowSocials, you can safely ignore this email.
          </p>
        </div>
        <div style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #999;">
          © ${new Date().getFullYear()} EscrowSocials. All rights reserved.
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Confirm your email with EscrowSocials",
      html: htmlContent,
    });
    console.log("Email sent successfully to", email);
  } catch (err) {
    console.error("Error sending verification email:", err);
  }
};
