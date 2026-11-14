import { randomBytes, createHash } from 'node:crypto';
import { validSlug } from './catalog.mjs';
export const codeHash = code => createHash('sha256').update(code).digest('hex');
export const normalizeCode = code => typeof code === 'string' ? code.trim().replace(/[-\s]/g,'').toUpperCase() : '';
const validCode = code => /^[A-F0-9]{16}$/.test(code);
const validityMs = 10 * 60 * 1000;
export function createRedemptions(db, auth, business) {
  const claims = db.collection('redemptions'), offers = db.collection('offers');
  async function activeOffer(slug) {
    const now=new Date();
    return offers.findOne({slug,published:true,example:{$ne:true},businessId:{$exists:true,$ne:null},$and:[{$or:[{startsAt:{$exists:false}},{startsAt:null},{startsAt:{$lte:now}}]},{$or:[{endsAt:{$exists:false}},{endsAt:null},{endsAt:{$gt:now}}]}]});
  }
  return {
    async init() { await claims.createIndex({userId:1,offerSlug:1},{unique:true}); await claims.createIndex({codeHash:1},{unique:true,sparse:true}); },
    async issue(token,slug) {
      const userId=await auth.userId(token); if(!userId) return {status:401,error:'Please sign in to use this offer.'};
      if(!validSlug(slug)) return {status:400,error:'Invalid offer.'};
      const offer=await activeOffer(slug); if(!offer) return {status:404,error:'This offer is not available to redeem.'};
      const raw=randomBytes(8).toString('hex').toUpperCase(); const expiresAt=new Date(Date.now()+validityMs);
      try {
        await claims.updateOne({userId,offerSlug:slug,redeemedAt:{$exists:false}},{$set:{codeHash:codeHash(raw),codeExpiresAt:expiresAt,businessId:offer.businessId},$setOnInsert:{userId,offerSlug:slug,createdAt:new Date()}},{upsert:true});
      } catch(error) { if(error.code===11000) return {status:409,error:'You have already redeemed this offer.'}; throw error; }
      return {code:raw.match(/.{4}/g).join('-'),expiresAt:expiresAt.toISOString()};
    },
    async redeem(token,input) {
      const businessId=await business.ownerId(token); if(!businessId) return {status:401,error:'Please sign in to your business account.'};
      const code=normalizeCode(input); if(!validCode(code)) return {status:400,error:'Enter a valid redemption code.'};
      const now=new Date(); const claim=await claims.findOne({codeHash:codeHash(code),businessId,redeemedAt:{$exists:false},codeExpiresAt:{$gt:now}});
      if(!claim) return {status:404,error:'Code is invalid, expired or already used.'};
      const offer=await activeOffer(claim.offerSlug); if(!offer || String(offer.businessId)!==String(businessId)) return {status:404,error:'This offer is no longer available.'};
      const result=await claims.updateOne({_id:claim._id,codeHash:codeHash(code),businessId,redeemedAt:{$exists:false},codeExpiresAt:{$gt:new Date()}},{$set:{redeemedAt:new Date()},$unset:{codeHash:'',codeExpiresAt:''}});
      if(!result.modifiedCount) return {status:409,error:'Code is invalid, expired or already used.'};
      return {redeemed:true,offerTitle:offer.title};
    },
  };
}
