export function previewResponse(method,path) {
  if (method === 'GET' && path === '/api/auth/session') return {status:200,body:{user:null}};
  if (method === 'GET' && path === '/api/business/session') return {status:200,body:{business:null}};
  if (method === 'GET' && /^\/api\/(categories|offers)(?:\/[^/]+)?$/.test(path)) return null;
  return {status:403,body:{error:'This hosted preview is read-only. Accounts and redemption are not available here.'}};
}
