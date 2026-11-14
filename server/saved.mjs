import { validSlug } from './catalog.mjs';
export function createSavedOffers(db, auth, catalog) {
  const saved = db.collection('savedOffers');
  async function owner(token) { return auth.userId(token); }
  return {
    async init() { await saved.createIndex({userId:1,offerSlug:1},{unique:true}); },
    async list(token) {
      const userId=await owner(token); if(!userId) return {status:401,error:'Please sign in to see saved offers.'};
      const entries=await saved.find({userId},{projection:{_id:0,offerSlug:1}}).sort({savedAt:-1}).limit(100).toArray();
      const results=await Promise.all(entries.map(async ({offerSlug})=>({slug:offerSlug,offer:await catalog.offer(offerSlug)})));
      return {saved:results};
    },
    async set(token,slug,save) {
      const userId=await owner(token); if(!userId) return {status:401,error:'Please sign in to save offers.'};
      if(!validSlug(slug)||typeof save!=='boolean') return {status:400,error:'Invalid request.'};
      if(save) { const offer=await catalog.offer(slug); if(!offer) return {status:404,error:'This offer is no longer available.'}; try { await saved.updateOne({userId,offerSlug:slug},{$setOnInsert:{userId,offerSlug:slug,savedAt:new Date()}},{upsert:true}); } catch (error) { if (error.code !== 11000) throw error; } }
      else await saved.deleteOne({userId,offerSlug:slug});
      return {saved:save};
    },
  };
}
