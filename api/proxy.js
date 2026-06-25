export default async function handler(req, res) {
  // CORS ප්‍රශ්න ඇති නොවීම සඳහා Headers සැකසීම
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Preflight (OPTIONS) request එකක් ආවොත් කෙලින්ම OK කරලා යවනවා
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // අපි යන්න හදන URL එක ලබාගැනීම
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing "url" parameter! Usage: ?url=https://...' });
  }

  try {
    // Target එකට යවන සැකසුම්
    const fetchOptions = {
      method: req.method,
      headers: {
        // App එකෙන් එන Headers ඒ විදිහටම යවනවා (User-Agent, Authorization වගේ)
        ...req.headers,
      }
    };

    // Vercel සර්වර් එකේ අවුල් යන්න පුළුවන් Headers අයින් කරනවා
    delete fetchOptions.headers['host'];
    delete fetchOptions.headers['connection'];
    delete fetchOptions.headers['content-length'];

    // GET/HEAD නෙවෙයි නම් (උදා: POST ෆොටෝ එකක් නම්) Body එකත් යවනවා
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = req.body;
    }

    // Vercel AWS සර්වර් එකෙන් Target API එකට පහර දීම 💥
    const response = await fetch(targetUrl, fetchOptions);
    
    // Target එකෙන් එන දත්ත අරගෙන ආපසු App එකට දීම
    const data = await response.text();
    
    // Target එකේ Content-Type එක (උදා: application/json ද image/png ද) කියලා සකස් කිරීම
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    res.status(response.status).send(data);
    
  } catch (error) {
    res.status(500).json({ error: 'Vercel Proxy Error: ' + error.message });
  }
}
