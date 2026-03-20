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
    // Step 1: Google Vision API
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
    console.log('Vision API status:', visionResponse.status);
    console.log('Vision API response:', JSON.stringify(visionData));

    if (visionData.error) {
      return res.status(400).json({ error: `Vision API error: ${visionData.error.message}` });
    }

    if (visionData.responses?.[0]?.error) {
      return res.status(400).json({ error: `Vision API response error: ${visionData.responses[0].error.message}` });
    }

    const extractedText = visionData.responses?.[0]?.fullTextAnnotation?.text || '';

    if (!extractedText) {
      return res.status(400).json({ error: 'Could not read text from image. Please try again with a clearer photo in good lighting.' });
    }

    console.log('Extracted text:', extractedText.substring(0, 200));

    // Step 2: Gemini to identify wine
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `From this wine label text, extract the wine name, vintage year, and region. IMPORTANT: Use ONLY text that appears on the label for the region — do NOT guess or use outside knowledge. Look for appellation, AVA, or place names printed on the label. Respond ONLY with a JSON object (no markdown, no backticks): {"wineName": "string", "vintage": number, "region": "string - exact region/appellation text found on label, or empty string if not visible"}. If you cannot determine the vintage, use ${new Date().getFullYear()}. Label text: ${extractedText}`
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

    res.status(200).json(parsed);
  } catch (e) {
    console.error('Scan error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
