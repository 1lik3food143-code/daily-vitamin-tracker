const keyCache = {
  apiKey: null,
  expiresAt: 0,
};

function getConfig(name) {
  const value = process.env[name];
  if (!value || value === 'paste-here') {
    const error = new Error(`${name} is not configured.`);
    error.fix = `Set ${name} in the server environment before handling AI requests.`;
    throw error;
  }
  return value;
}

function isUsable() {
  return Boolean(keyCache.apiKey && Date.now() < keyCache.expiresAt);
}

/**
 * Fetch and cache the server-only AI key from MindDo.
 *
 * Call invalidateKey() when the upstream AI provider reports that this key
 * is invalid; the next getKey() call will obtain a fresh key.
 */
async function getKey() {
  if (isUsable()) return keyCache.apiKey;

  const url = `${getConfig('KEYGEN_URL').replace(/\/$/, '')}/api/lookup-key`;
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getConfig('KEYGEN_TOKEN')}`,
        Accept: 'application/json',
      },
    });
  } catch (cause) {
    const error = new Error('Unable to reach the AI key service.');
    error.fix = 'Check KEYGEN_URL, network access, and the MindDo service status.';
    error.cause = cause;
    throw error;
  }

  let body;
  try {
    body = await response.json();
  } catch (cause) {
    const error = new Error('The AI key service returned an invalid response.');
    error.fix = `Inspect the MindDo response (HTTP ${response.status}) and service configuration.`;
    error.cause = cause;
    throw error;
  }

  if (!response.ok || !body.apiKey || !body.expiresAt) {
    const error = new Error(body.error?.message || 'The AI key service could not provide a key.');
    error.fix = body.error?.fix || `Check MindDo configuration and credentials (HTTP ${response.status}).`;
    throw error;
  }

  const expiresAt = Date.parse(body.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    const error = new Error('The AI key service returned an expired key.');
    error.fix = 'Check the expiresAt value returned by MindDo.';
    throw error;
  }

  keyCache.apiKey = body.apiKey;
  keyCache.expiresAt = expiresAt;
  return keyCache.apiKey;
}

function invalidateKey() {
  keyCache.apiKey = null;
  keyCache.expiresAt = 0;
}

module.exports = { getKey, invalidateKey };
