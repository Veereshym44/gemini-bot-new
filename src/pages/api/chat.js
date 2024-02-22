import { translate } from '@vitalets/google-translate-api';

export default async function handler(req, res) {
  const { message, to } = req.body;

  try {
    const proxy = 'http://103.152.112.162:80'; // Use the proxy you want to use
    const translation = await translate(message, { to, proxy });
    const translatedText = translation.text;
    res.status(200).json({ translatedText });
  } catch (error) {
    console.error("Error translating text:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
