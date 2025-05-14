const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generate2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: 'SustainaFood',
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCodeUrl
    });
  } catch (error) {
    console.error('2FA Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating 2FA credentials'
    });
  }
};

const verify2FA = async (req, res) => {
  try {
    const { secret, userToken } = req.body;

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: userToken
    });

    res.json({
      success: true,
      verified
    });
  } catch (error) {
    console.error('2FA Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying 2FA token'
    });
  }
};

module.exports = {
  generate2FA,
  verify2FA
};
