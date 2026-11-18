const fs = require('fs');
const http = require('http');
const path = require('path');
const { getKey, invalidateKey } = require('./getKey');
const root = path.resolve(__dirname, '..');
function loadEnv() { const file = path.join(root, '.env'); if (!fs.existsSync(file)) return; for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) { const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/); if (match && !process.env[match[1]]) process.env[match[1]] = match[2]; } }
function aiInstructions() { const brief = fs.readFileSync(path.join(root, 'BRIEF.md'), 'utf8'); return brief.split('## My AI’s instructions')[1]?.split('\n## ')[0]?.trim() || ''; }
function sendJson(response, status, body) { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); response.end(JSON.stringify(body)); }
async function askAI(message) {
  const apiKey = await getKey();
  const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-5.6-luna', messages: [{ role: 'system', content: aiInstructions() }, { role: 'user', content: message }] }) });
  const body = await response.json();
  if (response.status === 401) invalidateKey();
  if (!response.ok) { const error = new Error(body.error?.message || 'The AI could not answer right now.'); error.fix = 'Check the AI key and OpenAI access.'; throw error; }
  return body.choices?.[0]?.message?.content || 'I could not find an answer. Please try again.';
}
loadEnv();
const server = http.createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/ask') {
    let raw = ''; request.on('data', chunk => { raw += chunk; }); request.on('end', async () => { try { const { message } = JSON.parse(raw || '{}'); if (!message?.trim()) return sendJson(response, 400, { error: { message: 'Please ask a vitamin question.', fix: 'Enter a question before sending.' } }); return sendJson(response, 200, { answer: await askAI(message.trim()) }); } catch (error) { console.error(error.fix || 'AI request failed.'); return sendJson(response, 500, { error: { message: error.message || 'Please check the internet and try again.' } }); } }); return;
  }
  const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0]; const file = path.resolve(root, `.${requested}`); if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return sendJson(response, 404, { error: 'Not found' }); const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }; response.writeHead(200, { 'Content-Type': `${types[path.extname(file)] || 'text/plain'}; charset=utf-8` }); fs.createReadStream(file).pipe(response);
});
server.listen(5173, '127.0.0.1', () => console.log('Daily Vitamin Tracker running at http://127.0.0.1:5173'));
