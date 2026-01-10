import mongoose from 'mongoose';
import { connectDB } from '../lib/mongodb';
import { Student } from '../lib/models/Student';

async function removeDuplicates() {
  await connectDB();
  console.log('Connected to MongoDB');

  const duplicates = await Student.aggregate([
    {
      $group: {
        _id: { code: "$code" },
        uniqueIds: { $addToSet: "$_id" },
        count: { $sum: 1 }
      }
    },
    {
      $match: {
        count: { $gt: 1 }
      }
    }
  ]);

  console.log(`Found ${duplicates.length} duplicate groups`);

  for (const group of duplicates) {
    const [keep, ...remove] = group.uniqueIds;
    console.log(`Processing group ${group._id.code}: Keeping ${keep}, Removing ${remove.length} duplicates`);
    
    await Student.deleteMany({
      _id: { $in: remove }
    });
  }

  console.log('Finished removing duplicates');
  process.exit(0);
}

removeDuplicates().catch(err => {
  console.error(err);
  process.exit(1);
});
