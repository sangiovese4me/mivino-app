export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { wineName, vintage, region } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
  }

  const regionHint = region ? `. The wine is from ${region} — use this exact region, do not substitute with a different region` : '';

  const prompt = `You are an expert sommelier with access to wine producer tech sheets and official documentation. For the wine "${wineName}" vintage ${vintage}${regionHint}:

1. Search for the official producer tech sheet, winery website, or wine notes for this specific wine and vintage if available.
2. Search for where this wine can be purchased online.
3. Use that information to provide accurate, specific details including blend percentages if it is a blended wine.

Respond ONLY with this exact JSON structure (no markdown, no backticks):
{
  "region": "string - exact region/appellation",
  "grapeVarieties": "string - grape varieties and blend percentages if available (e.g. 78% Cabernet Sauvignon, 12% Merlot, 10% Petit Verdot), or just the variety if single varietal",
  "tastingNotes": "string - 2-3 sentences combining aroma and palate in plain prose",
  "winemaking": "string - brief winemaking notes such as barrel aging, fermentation details if available, otherwise empty string",
  "foodPairings": ["food1", "food2", "food3"],
  "peakWindow": {"start": 2024, "end": 2030},
  "peakSummary": "string - one sentence about when to drink",
  "wineryUrl": "string - official winery website URL if found, otherwise empty string",
  "purchaseUrl": "string - best purchase link from Wine.com, Vivino, Total Wine, or winery direct if found, otherwise empty string"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tools: [{ google_search: {} }],
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data));
    const text = data.candidates?.[0]?.content?.parts?.find(p => p.text)?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.status(200).json({ content: [{ text: JSON.stringify(parsed) }] });
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
