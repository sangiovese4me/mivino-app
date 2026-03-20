export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { wineName, vintage, region } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
  }

  const regionHint = region ? `. The wine is from ${region} — use this exact region, do not substitute with a different region` : '';

  const prompt = `You are a sommelier. For the wine "${wineName}" vintage ${vintage}${regionHint}, respond ONLY with this exact JSON structure, no other keys, no markdown, no backticks, no extra fields:
{"region":"string - use provided region if given, otherwise best known region","tastingNotes":"string - 2-3 sentences combining aroma and palate in plain prose","foodPairings":["food1","food2","food3"],"peakWindow":{"start":2024,"end":2030},"peakSummary":"string - one sentence about when to drink"}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data));
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.status(200).json({ content: [{ text: JSON.stringify(parsed) }] });
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
