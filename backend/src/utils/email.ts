const nodemailer = require("nodemailer");

exports.sendEmail = async (options: any) => {
  //1. create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2. define email options
  const mailOptions = {
    from: "Majid Khan <mak@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  //3. send the email
  await transporter.sendMail(mailOptions);
};
