import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email: string, link: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email",
    html: `<p>Please verify your email by clicking <a href="${link}">this link</a>.</p>`,
  });
};
