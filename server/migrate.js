import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OLD_URI = "mongodb+srv://aravindc29_db_user:9QwdE0d9NbUxzDxl@cluster0.v871vy0.mongodb.net/nandhi_motors?retryWrites=true&w=majority&appName=Cluster0";
const NEW_URI = "mongodb+srv://aravindc29_db_user:2L9G2gmzYTVi6cX2@cluster0.vx2sqbh.mongodb.net/nandhi_motors?retryWrites=true&w=majority&appName=Cluster0";

async function runMigration() {
  console.log('--- Starting MongoDB Database Migration ---');
  
  // 1. Try reading from Old Database
  let oldData = {};
  let oldConnected = false;
  try {
    console.log('Connecting to OLD database to extract existing collections...');
    const oldConn = await mongoose.createConnection(OLD_URI, { serverSelectionTimeoutMS: 5000 }).asPromise();
    console.log('✓ Successfully connected to OLD database.');
    oldConnected = true;

    const collections = await oldConn.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in OLD database:`, collections.map(c => c.name));

    for (const col of collections) {
      const docs = await oldConn.db.collection(col.name).find({}).toArray();
      oldData[col.name] = docs;
      console.log(`- Fetched ${docs.length} records from [${col.name}]`);
    }

    await oldConn.close();
    console.log('Closed connection to OLD database.');
  } catch (err) {
    console.warn('⚠️ Could not extract data from old database (may be deleted or IP whitelisted):', err.message);
  }

  // 2. Connect to New Database
  console.log('\nConnecting to NEW database...');
  const newConn = await mongoose.createConnection(NEW_URI, { serverSelectionTimeoutMS: 8000 }).asPromise();
  console.log('✓ Successfully connected to NEW database!');

  // 3. Migrate records
  if (oldConnected && Object.keys(oldData).length > 0) {
    console.log('\nTransferring existing collections to NEW database...');
    for (const [colName, docs] of Object.entries(oldData)) {
      if (docs.length > 0) {
        // Clean docs of any driver-specific internal metadata if necessary
        const targetCol = newConn.db.collection(colName);
        for (const doc of docs) {
          await targetCol.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
        }
        console.log(`✓ Migrated ${docs.length} documents into [${colName}] in NEW database.`);
      }
    }
  } else {
    console.log('No old records to migrate directly; new database will auto-seed upon server start.');
  }

  await newConn.close();
  console.log('\n✓ Migration complete!');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
