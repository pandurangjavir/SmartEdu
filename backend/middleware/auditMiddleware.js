const fs = require('fs');
const path = require('path');

function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;
  const clone = { ...body };
  if (clone.password) clone.password = '[REDACTED]';
  if (clone.token) clone.token = '[REDACTED]';
  return clone;
}

function auditLog(req, res, next) {
  try {
    const method = req.method;
    const shouldLog = method === 'POST' || method === 'PUT' || method === 'DELETE';
    if (!shouldLog) return next();

    const entry = {
      timestamp: new Date().toISOString(),
      userId: req.user?.id || null,
      role: req.user?.role || null,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      body: sanitizeBody(req.body),
      params: req.params,
    };

    // Console log
    // eslint-disable-next-line no-console
    console.log('[AUDIT]', JSON.stringify(entry));

    // Append to file (best-effort)
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'audit.log');
    try {
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      fs.appendFile(logFile, JSON.stringify(entry) + '\n', () => {});
    } catch (_) {}
  } catch (_) {}
  return next();
}

module.exports = { auditLog };


