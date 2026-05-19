export default async function handler(req, res) {
  if (req.method === 'POST') {
    let text;
    if (typeof req.body === 'string') {
      try {
        text = JSON.parse(req.body).text;
      } catch (e) {}
    } else {
      text = req.body?.text;
    }
    
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(500).json({ error: 'Telegram credentials missing in environment variables.' });
    }

    if (!text) {
      return res.status(400).json({ error: 'Missing text payload.' });
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.description || 'Failed to send Telegram message');
      }

      res.status(200).json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).end();
  }
}
