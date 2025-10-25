import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

export async function connectTestDb() {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}

export async function clearDb(models = []) {
  if (models.length) {
    await Promise.all(models.map((m) => m.deleteMany({})));
  } else {
    const collections = Object.values(mongoose.connection.collections);
    for (const c of collections) await c.deleteMany({});
  }
}

export async function closeTestDb() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
}
