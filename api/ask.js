const fs = require('fs');
const path = require('path');
const { getKey, invalidateKey } = require('../server/getKey');

function aiInstructions() {
  const brief = fs.readFileSync(path.join(process.cwd(), 'BRIEF.md'), 'utf8');
  return brief.split('## My AI’s instructions')[1]?.split('\n## ')[0]?.trim() || '';
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: { message: 'Only POST requests are supported.' } });
  }

  try {
    const message = request.body?.message;
    if (!message?.trim()) {
      return response.status(400).json({ error: { message: 'Please ask a vitamin question.' } });
    }

    const apiKey = await getKey();
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        messages: [
          { role: 'system', content: aiInstructions() },
          { role: 'user', content: message.trim() },
        ],
      }),
    });
    const body = await openAIResponse.json();
    if (openAIResponse.status === 401) invalidateKey();
    if (!openAIResponse.ok) {
      const error = new Error(body.error?.message || 'The AI could not answer right now.');
      error.fix = 'Check the AI key and OpenAI access.';
      throw error;
    }
    return response.status(200).json({ answer: body.choices?.[0]?.message?.content || 'I could not find an answer. Please try again.' });
  } catch (error) {
    console.error(error.fix || 'AI request failed.');
    return response.status(500).json({ error: { message: error.message || 'Please check the internet and try again.' } });
  }
};
