const nodemailer = require("nodemailer");
const crypto = require("crypto");

function generateResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return token;
}

const resetPassword = (req, res) => {
  const { email } = req.body;
  const siteURL = req.headers.origin; // Retrieve the site URL from the request object

  // Generate a unique token or URL for password reset
  const resetToken = generateResetToken();

  // Store the resetToken and associate it with the user's account
  // (e.g., save it in a database or cache)

  // Construct the password reset email
  const resetURL = `${siteURL}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: "mailer@office.wsm.warszawa.pl",
    to: email,
    subject: "Password Reset",
    text: `Click the following link to reset your password: ${resetURL}`,
  };

  // Send the email using Nodemailer or any other email sending library
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    secure: false,
    port: "587",
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
    auth: {
      user: "mailer@office.wsm.warszawa.pl",
      pass: "=s(k=%K*/<",
    },
    debug: true,
    logger: true,
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      // Handle the error appropriately
      res.status(500).send("Failed to send password reset email");
    } else {
      console.log("Password reset email sent:", info.response);
      // Handle the success response
      res.status(200).send("Password reset email sent successfully");
    }
  });
};

module.exports = {
  resetPassword,
};
