/** Base64 label photos exceed the default 1mb body limit without this. */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { imageBase64 } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
  }

  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    // Step 1: Google Vision API to extract text
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: imageBase64 },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
          }]
        })
      }
    );

    const visionData = await visionResponse.json();

    if (visionData.error) {
      return res.status(400).json({ error: `Vision API error: ${visionData.error.message}` });
    }

    if (visionData.responses?.[0]?.error) {
      return res.status(400).json({ error: `Vision API error: ${visionData.responses[0].error.message}` });
    }

    const extractedText = visionData.responses?.[0]?.fullTextAnnotation?.text || '';

    if (!extractedText) {
      return res.status(400).json({ error: 'Could not read text from image. Please try again with a clearer photo in good lighting.' });
    }

    console.log('Extracted text:', extractedText.substring(0, 200));

    // Step 2: Gemini validates this is a wine label AND extracts details
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a wine label validator. Analyze this text extracted from an image and determine if it is from a wine bottle label.

A wine label typically contains: a wine name or producer, a vintage year (4-digit year between 1900-${new Date().getFullYear()}), grape variety or wine type (e.g. Cabernet Sauvignon, Chardonnay, Barolo), alcohol content (e.g. 13.5% alc), and/or a wine region or appellation.

If this is NOT a wine label, respond ONLY with: {"isWine": false}

If this IS a wine label, respond ONLY with this JSON (no markdown, no backticks):
{"isWine": true, "wineName": "string", "vintage": number, "region": "string or empty string"}

If you cannot determine the vintage, use ${new Date().getFullYear()}.

Label text: ${extractedText}`
            }]
          }]
        })
      }
    );

    const geminiData = await geminiResponse.json();
    console.log('Gemini response:', JSON.stringify(geminiData));

    const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = geminiText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (!parsed.isWine) {
      return res.status(400).json({ error: 'This does not appear to be a wine label. Please scan a wine bottle label.' });
    }

    res.status(200).json({
      wineName: parsed.wineName,
      vintage: parsed.vintage,
      region: parsed.region || ''
    });

  } catch (e) {
    console.error('Scan error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
