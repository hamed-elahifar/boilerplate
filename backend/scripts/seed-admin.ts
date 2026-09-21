// Creates (or resets the password of) a development admin user.
// Run from backend/: bun run seed
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const username = 'admin';
const password = 'admin123';

async function main() {
  // Bun loads backend/.env into process.env.
  await mongoose.connect(process.env.MONGO_URL!);
  await mongoose.connection.collection('authentities').updateOne(
    { username },
    {
      $set: {
        password: await bcrypt.hash(password, 10),
        role: 'ADMIN',
        isActive: true,
      },
      $setOnInsert: { createdAt: new Date() },
      $currentDate: { updatedAt: true },
    },
    { upsert: true },
  );
  console.log(`Seeded ${username} / ${password}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
