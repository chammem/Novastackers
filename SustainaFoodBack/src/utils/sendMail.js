const nodemailer = require("nodemailer");
require("dotenv").config();

// Configuration du transporteur Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Votre adresse Gmail
    pass: process.env.EMAIL_PASS, // Votre mot de passe Gmail
  },
});

// Fonction pour envoyer un e-mail de réinitialisation de mot de passe
const sendResetPasswordEmail = async (email, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Expéditeur
    to: email, // Destinataire
    subject: "Réinitialisation de votre mot de passe", // Sujet de l'email
    html: `<p>Cliquez sur ce lien pour réinitialiser votre mot de passe : <a href="${resetLink}">${resetLink}</a></p>`, // Corps de l'email au format HTML
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("E-mail envoyé avec succès à :", email);
    return { success: true, message: "E-mail envoyé avec succès." };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail :", error);
    return { success: false, message: "Erreur lors de l'envoi de l'e-mail." };
  }
};

module.exports = { sendResetPasswordEmail };