import { afterAll, afterEach, beforeAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

process.env.JWT_SECRET = "testni-skrivni-kljuc";

let replSet;

// Replica set je potreben, ker izbira ponudbe uporablja transakcijo.
beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
  await Promise.all(
    Object.values(mongoose.models).map((model) => model.init())
  );
});

afterEach(async () => {
  const zbirke = await mongoose.connection.db.collections();
  await Promise.all(zbirke.map((zbirka) => zbirka.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet?.stop();
});
