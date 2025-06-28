const nodemailer = require("nodemailer");

async function testMail() {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "infosysharihar@gmail.com",
      pass: "cumb cybr pfkl xpdh",
    },
  });

  let info = await transporter.sendMail({
    from: '"Harihar Infosys" <infosysharihar@gmail.com>',
    to: "yanishsingh.official@gmail.com",
    subject: "Test Email",
    text: "This is a test email from the system",
  });

  console.log("Email sent:", info.messageId);
}

testMail();
