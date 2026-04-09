/** Base64 label photos exceed the default 1mb body limit without this. */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

function normalizeBase64(imageBase64) {
  if (!imageBase64 || typeof imageBase64 !== 'string') return '';
  const s = imageBase64.trim();
  const comma = s.indexOf(',');
  if (s.startsWith('data:') && comma !== -1) return s.slice(comma + 1);
  return s;
}

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function wineJsonPromptFromLabelText(extractedText) {
  return `From this wine label text, extract the wine name, vintage year, and region. IMPORTANT: Use ONLY text that appears on the label for the region — do NOT guess or use outside knowledge. Look for appellation, AVA, or place names printed on the label. Respond ONLY with a JSON object (no markdown, no backticks): {"wineName": "string", "vintage": number, "region": "string - exact region/appellation text found on label, or empty string if not visible"}. If you cannot determine the vintage, use ${new Date().getFullYear()}. Label text: ${extractedText}`;
}

function wineJsonPromptFromImage() {
  return `Look at this wine label photo. Extract the wine name, vintage year, and region. IMPORTANT: Use ONLY what is visible on the label — do NOT guess or use outside knowledge. Look for appellation, AVA, or place names printed on the label. Respond ONLY with a JSON object (no markdown, no backticks): {"wineName": "string", "vintage": number, "region": "string - exact region/appellation text found on label, or empty string if not visible"}. If you cannot determine the vintage, use ${new Date().getFullYear()}.`;
}

async function geminiJsonFromParts(apiKey, parts) {
  const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] })
  });
  const geminiData = await geminiResponse.json();
  console.log('Gemini response:', JSON.stringify(geminiData));

  if (geminiData.error) {
    throw new Error(geminiData.error.message || 'Gemini API error');
  }

  const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!geminiText.trim()) {
    const block = geminiData.promptFeedback?.blockReason;
    if (block) throw new Error(`Image was blocked (${block}). Try another photo.`);
    throw new Error('No response from the model. Try a clearer label photo.');
  }
  const clean = geminiText.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(clean.slice(start, end + 1));
    }
    throw new Error('Could not read wine details from the scan. Try a clearer photo.');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { imageBase64 } = req.body;

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        'No Gemini API key. In mivino-app/.env.local set GEMINI_API_KEY=your_key (from https://aistudio.google.com/apikey — must look like AIzaSy...), save the file, then restart npm run dev.'
    });
  }

  const rawBase64 = normalizeBase64(imageBase64);
  if (!rawBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    if (process.env.VISION_API_KEY) {
      const visionResponse = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${process.env.VISION_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { content: rawBase64 },
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
        return res.status(400).json({
          error: `Vision API response error: ${visionData.responses[0].error.message}`
        });
      }

      const extractedText = visionData.responses?.[0]?.fullTextAnnotation?.text || '';

      if (!extractedText) {
        return res.status(400).json({
          error:
            'Could not read text from image. Please try again with a clearer photo in good lighting.'
        });
      }

      console.log('Extracted text:', extractedText.substring(0, 200));

      const parsed = await geminiJsonFromParts(apiKey, [{ text: wineJsonPromptFromLabelText(extractedText) }]);
      res.status(200).json(parsed);
      return;
    }

    const parsed = await geminiJsonFromParts(apiKey, [
      { inline_data: { mime_type: 'image/jpeg', data: rawBase64 } },
      { text: wineJsonPromptFromImage() }
    ]);
    res.status(200).json(parsed);
  } catch (e) {
    console.error('Scan error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
