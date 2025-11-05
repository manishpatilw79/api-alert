import twilio from "twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  const { alert } = req.body || {};

  if (!alert) {
    return res.status(400).json({ error: "Missing alert data" });
  }

  // Twilio credentials
  const accountSid = process.env.AC07b67072c61ca1651793c18c0a990a10;
  const authToken = process.env.20ad8376968010d468c1c11a85ba4b3b;
  const fromNumber = process.env.+12626841904;
  const toNumber = process.env.+917028217782;

  try {
    const client = twilio(accountSid, authToken);

    await client.calls.create({
      url: "http://demo.twilio.com/docs/voice.xml",
      to: toNumber,
      from: fromNumber,
    });

    return res.status(200).json({ success: true, message: "Call sent successfully!" });
  } catch (err) {
    console.error("Twilio Error:", err.message);
    return res.status(500).json({ error: "Twilio call failed", details: err.message });
  }
}
