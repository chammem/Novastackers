const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../../models/userModel");

const ForgotPassword = async (req, res) => {
    const { email } = req.body;

    // 1. Validation de l'email
    if (!email) {
        return res.status(400).json({ message: "L'email est requis." });
    }

    try {
        // 2. Trouver l'utilisateur par email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // 3. Générer un token de réinitialisation
        const token = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expire dans 1 heure
        await user.save();

        // 4. Configuration du transporteur Nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Votre adresse Gmail
                pass: process.env.EMAIL_PASS, // Votre mot de passe Gmail
            },
        });

        // 5. Options de l'email
        const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USER, // Expéditeur
            to: email, // Destinataire
            subject: "Réinitialisation de mot de passe", // Sujet de l'email
            html: `
                <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p>
                <a href="${resetUrl}">Réinitialiser</a>
                <p>Ce lien expirera dans 1 heure.</p>
            `, // Corps de l'email au format HTML
        };

        // 6. Envoyer l'email
        console.log("Envoi d'email à :", email);
        console.log("Token généré :", token);
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email envoyé avec succès." });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
    }
};

module.exports = ForgotPassword;