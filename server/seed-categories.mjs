// Insert only missing default categories into a local development database.
import { MongoClient } from 'mongodb';
const uri=process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
if (!/^mongodb:\/\/(127\.0\.0\.1|localhost)(:\d+)?(?:\/|\?|$)/.test(uri)) { console.error('This seed is restricted to a local MongoDB server.'); process.exit(1); }
const categories=[
  {slug:'dining',title:'Food & dining',headline:'Good food. Better company.',description:'Great meals and new places to explore.',image:'/assets/dining.png',published:true,order:1},
  {slug:'shopping',title:'Shopping & lifestyle',headline:'A little joy in the everyday.',description:'Discover brands and products you enjoy.',image:'/assets/shopping.png',published:true,order:2},
  {slug:'experiences',title:'Fun & experiences',headline:'More plans. More memories.',description:'Entertainment, activities, and shared adventures.',image:'/assets/cinema.png',published:true,order:3},
];
const client=new MongoClient(uri,{serverSelectionTimeoutMS:3000});
try { await client.connect(); const collection=client.db(process.env.MONGODB_DATABASE || 'choop').collection('categories'); await collection.createIndex({slug:1},{unique:true}); for(const category of categories) await collection.updateOne({slug:category.slug},{$setOnInsert:category},{upsert:true}); console.log('Default categories inserted where absent; existing records were not changed.'); }
catch { console.error('Could not seed local categories. Check that MongoDB is running.'); process.exitCode=1; }
finally { await client.close(); }
