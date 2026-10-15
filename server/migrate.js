import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const oldUri = process.env.OLD_MONGODB_URI;
const newUri = process.env.NEW_MONGODB_URI;

async function runMigration() {
  if (!oldUri || !newUri) {
    throw new Error('Set OLD_MONGODB_URI and NEW_MONGODB_URI in the server environment before running migration.');
  }

  console.log('--- Starting MongoDB Database Migration ---');

  let oldData = {};
  let oldConnected = false;
  let oldConn;
  let newConn;

  try {
    console.log('Connecting to OLD database to extract existing collections...');
    oldConn = await mongoose.createConnection(oldUri, { serverSelectionTimeoutMS: 5000 }).asPromise();
    console.log('Connected to OLD database.');
    oldConnected = true;

    const collections = await oldConn.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in OLD database:`, collections.map(collection => collection.name));

    for (const collection of collections) {
      const documents = await oldConn.db.collection(collection.name).find({}).toArray();
      oldData[collection.name] = documents;
      console.log(`Fetched ${documents.length} records from [${collection.name}]`);
    }
  } catch (error) {
    throw new Error(`Could not read from OLD database: ${error.message}`, { cause: error });
  } finally {
    if (oldConn) await oldConn.close();
  }

  try {
    console.log('Connecting to NEW database...');
    newConn = await mongoose.createConnection(newUri, { serverSelectionTimeoutMS: 8000 }).asPromise();
    console.log('Connected to NEW database.');

    if (oldConnected) {
      for (const [collectionName, documents] of Object.entries(oldData)) {
        if (documents.length === 0) continue;
        const targetCollection = newConn.db.collection(collectionName);
        for (const document of documents) {
          await targetCollection.updateOne({ _id: document._id }, { $set: document }, { upsert: true });
        }
        console.log(`Migrated ${documents.length} documents into [${collectionName}].`);
      }
    }

    console.log('Migration complete.');
  } finally {
    if (newConn) await newConn.close();
  }
}

runMigration().catch(error => {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
});
