import { connectDB } from './lib/mongodb';
import mongoose from 'mongoose';

async function fixIndices() {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) throw new Error('DB not connected');
    
    const collections = await db.listCollections({ name: 'students' }).toArray();
    if (collections.length === 0) {
      console.log('Students collection not found');
      process.exit(0);
    }

    const students = db.collection('students');
    
    console.log('Current indices:');
    const indices = await students.listIndexes().toArray();
    console.log(JSON.stringify(indices, null, 2));

    try {
      await students.dropIndex('code_1');
      console.log('Dropped unique index: code_1');
    } catch (e) {
      console.log('Index code_1 not found or already dropped');
    }

    // Mongoose will recreate the compound index based on the model definition
    console.log('Indices after drop attempt:');
    const newIndices = await students.listIndexes().toArray();
    console.log(JSON.stringify(newIndices, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error fixing indices:', error);
    process.exit(1);
  }
}

fixIndices();
