export function authSecret() {
  const secret=process.env.NEXTAUTH_SECRET;
  if(process.env.NODE_ENV==='production' && !secret) throw new Error('NEXTAUTH_SECRET is required in production');
  return secret || 'dev-secret';
}
