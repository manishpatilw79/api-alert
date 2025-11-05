// api/alert.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  try {
    const body = req.body || (await new Promise(r => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => r(JSON.parse(data || '{}')));
    }));

    const accountSid = process.env.AC07b67072c61ca1651793c18c0a990a10;
    const authToken  = process.env.20ad8376968010d468c1c11a85ba4b3b;
    const fromNumber = process.env.+12626841904;   // must be a Twilio number you own
    const toNumber   = process.env.+917028217782;      // destination phone

    if (!accountSid || !authToken || !fromNumber || !toNumber) {
      return res.status(500).json({ error: 'Missing Twilio env vars' });
    }

    // Build voice message using TwiML inline
    const detectedAt = body.ts_us ? new Date(Number(body.ts_us) / 1000).toISOString() : new Date().toISOString();
    const width_us = body.width_us || 0;
    const spoken = `Security alert. Sensor triggered. Duration ${Math.round(width_us)} microseconds. Time ${detectedAt}.`;

    // Twilio Calls API - create call
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
    const basic = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    // Use 'Twiml' parameter to send inline TwiML (supported). See Twilio docs.
    const params = new URLSearchParams();
    params.append('From', fromNumber);
    params.append('To', toNumber);
    params.append('Twiml', `<Response><Say voice="alice">${spoken}</Say></Response>`);

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const j = await resp.json();
    if (!resp.ok) {
      return res.status(500).json({ error: 'Twilio error', details: j });
    }

    return res.status(200).json({ success: true, twilio: j });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
