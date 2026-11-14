// Run explicitly against a local development database only. Existing documents are never overwritten.
import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const database = process.env.MONGODB_DATABASE || 'choop';
if (!/^mongodb:\/\/(127\.0\.0\.1|localhost)(:\d+)?(?:\/|\?|$)/.test(uri)) {
  console.error('Example seeding is restricted to a local MongoDB server.'); process.exit(1);
}
const categories = [
  { slug:'dining',title:'Food & dining',headline:'Good food. Better company.',description:'Great meals, better prices, and new places to explore.',image:'/assets/dining.png',published:true,order:1 },
  { slug:'shopping',title:'Shopping & lifestyle',headline:'A little joy in the everyday.',description:'Find offers on the brands and products you enjoy.',image:'/assets/shopping.png',published:true,order:2 },
  { slug:'experiences',title:'Fun & experiences',headline:'More plans. More memories.',description:'Entertainment, activities, and shared adventures.',image:'/assets/cinema.png',published:true,order:3 },
];
const offers = [
  { slug:'cafe-treat',title:'Cafe Treat',categorySlug:'dining',description:'Enjoy a coffee and a little something sweet.',image:'/assets/cafe-portrait.png',discountPercent:20,merchant:{name:'Example café'},terms:['Example offer only. Terms have not been finalized.'],redemptionSteps:['Ask the store about eligible items.'],example:true,published:true },
  { slug:'style-deal',title:'A little refresh for your wardrobe',categorySlug:'shopping',description:'Discover everyday essentials and the finishing touches that make an outfit yours.',image:'/assets/shopping.png',discountPercent:30,merchant:{name:'The Everyday Edit'},terms:['30% off eligible full-price clothing and accessories, up to ₹600.','Minimum purchase of ₹2,000 in a single transaction.','Valid once per customer in store; excludes gift cards and other discounts.'],redemptionSteps:['Find eligible styles in store.','Show your claimed coupon at checkout.','The store applies the discount to an eligible purchase.'],example:true,published:true },
  { slug:'weekend-special',title:'Weekend Special',categorySlug:'experiences',description:'Make time for a shared experience.',image:'/assets/cinema.png',discountPercent:40,merchant:{name:'Example venue'},terms:['Example offer only. Terms have not been finalized.'],redemptionSteps:['Check availability with the venue.'],example:true,published:true },
];
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
try {
  await client.connect(); const db=client.db(database);
  for (const [name, documents] of [['categories',categories],['offers',offers]]) {
    const collection=db.collection(name);
    await collection.createIndex({slug:1},{unique:true});
    for (const document of documents) await collection.updateOne({slug:document.slug},{$setOnInsert:document},{upsert:true});
  }
  console.log('Example records inserted where absent; existing records were not changed.');
} catch { console.error('Could not seed the local database. Check MongoDB is running and the driver is installed.'); process.exitCode=1; }
finally { await client.close(); }
