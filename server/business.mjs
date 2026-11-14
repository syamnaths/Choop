import { normalizeEmail, validateCredentials, hashPassword, verifyPassword, makeToken, hashToken } from './auth.mjs';
import { validSlug } from './catalog.mjs';
const duration = 7 * 24 * 60 * 60 * 1000;
function text(value, max) { return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max && !/[\u0000-\u001f\u007f]/.test(value) ? value.trim() : null; }
export function validateCoupon(data) {
  const title = text(data?.title, 80), description = text(data?.description, 500), categorySlug = data?.categorySlug;
  const discountPercent = Number(data?.discountPercent);
  if (!title || !description || !validSlug(categorySlug) || !Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) return null;
  const terms = typeof data.terms === 'string' ? data.terms.split('\n').map(x => x.trim()).filter(Boolean) : [];
  if (terms.length > 10 || terms.some(x => x.length > 300)) return null;
  return { title, description, categorySlug, discountPercent, terms };
}
export function createBusiness(db) {
  const accounts=db.collection('businesses'), sessions=db.collection('businessSessions'), offers=db.collection('offers'), categories=db.collection('categories');
  async function issue(businessId) { const token=makeToken(); await sessions.insertOne({tokenHash:hashToken(token),businessId,expiresAt:new Date(Date.now()+duration)}); return token; }
  async function owner(token) { if (!token) return null; const session=await sessions.findOne({tokenHash:hashToken(token),expiresAt:{$gt:new Date()}}); return session ? accounts.findOne({_id:session.businessId}) : null; }
  return {
    async init() { await accounts.createIndex({email:1},{unique:true}); await sessions.createIndex({tokenHash:1},{unique:true}); await sessions.createIndex({expiresAt:1},{expireAfterSeconds:0}); await offers.createIndex({slug:1},{unique:true}); },
    async register(input) { const email=normalizeEmail(input.email), name=text(input.businessName,100); if (!name || !validateCredentials(email,input.password)) return {status:400,error:'Enter a business name, a valid email and a password of 12–128 characters.'}; const passwordHash=await hashPassword(input.password); try { const result=await accounts.insertOne({name,email,passwordHash,createdAt:new Date()}); return {business:{name,email},token:await issue(result.insertedId)}; } catch(e) { if(e.code===11000) return {status:409,error:'A business account with that email already exists.'}; throw e; } },
    async login(input) { const email=normalizeEmail(input.email); const business=email.length<=254?await accounts.findOne({email}):null; if(!business || !(await verifyPassword(input.password,business.passwordHash))) return {status:401,error:'Email or password is incorrect.'}; return {business:{name:business.name,email:business.email},token:await issue(business._id)}; },
    async ownerId(token) { return (await owner(token))?._id || null; },
    async session(token) { const business=await owner(token); return business?{name:business.name,email:business.email}:null; },
    async logout(token) { if(token) await sessions.deleteOne({tokenHash:hashToken(token)}); },
    async list(token) { const business=await owner(token); if(!business) return {status:401,error:'Please sign in to your business account.'}; return {offers:await offers.find({businessId:business._id},{projection:{_id:0,slug:1,title:1,categorySlug:1,discountPercent:1,published:1}}).sort({createdAt:-1}).limit(100).toArray()}; },
    async create(token,input) { const business=await owner(token); if(!business) return {status:401,error:'Please sign in to your business account.'}; const coupon=validateCoupon(input); if(!coupon) return {status:400,error:'Enter a title, description, category and a discount from 1 to 100.'}; const category=await categories.findOne({slug:coupon.categorySlug,published:true}); if(!category) return {status:400,error:'Choose an available category.'}; const slug=`${coupon.title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55).replace(/-$/,'') || 'offer'}-${makeToken().slice(0,8).toLowerCase().replace(/[^a-z0-9]/g,'a')}`; await offers.insertOne({...coupon,slug,businessId:business._id,merchant:{name:business.name},image:category.image,example:false,published:false,createdAt:new Date()}); return {offer:{slug,title:coupon.title,published:false}}; },
    async setPublished(token,slug,published) { const business=await owner(token); if(!business) return {status:401,error:'Please sign in to your business account.'}; if(!validSlug(slug)||typeof published!=='boolean') return {status:400,error:'Invalid request.'}; const result=await offers.updateOne({slug,businessId:business._id},{$set:{published}}); return result.matchedCount ? {ok:true} : {status:404,error:'Coupon not found.'}; },
  };
}
