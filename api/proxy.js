export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    const fetchOptions = {
      method: req.method,
      headers: { ...req.headers }
    };

    // Vercel Headers කපා හැරීම (ඔබේ IP එක සැඟවීම)
    const headersToStrip = ['x-forwarded-for', 'x-real-ip', 'forwarded', 'host', 'connection', 'x-vercel-id', 'x-vercel-forwarded-for'];
    headersToStrip.forEach(h => delete fetchOptions.headers[h]);

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = req.body;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();
    
    // 🔥 FIX: බ්‍රව්සර් එකට මේක JSON එකක් බව පැවසීම (Black Screen/Format වීමට)
    const contentType = response.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', contentType);

    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
