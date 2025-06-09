import dotenv from 'dotenv';
import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 4000;
const MONGO_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'xmlrulesdb';
let dbClient;

app.use(cors());
app.use(express.json());

// MongoDB connection
async function getDb() {
  if (!dbClient) {
    dbClient = new MongoClient(MONGO_URL, { useUnifiedTopology: true });
    await dbClient.connect();
  }
  return dbClient.db(DB_NAME);
}

// POST /bursaries - create a new bursary
app.post('/bursaries', async (req, res) => {
  const { awardName, adminUser, xmlString } = req.body;
  if (!awardName || !adminUser || !xmlString) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const db = await getDb();
    const bursaries = db.collection('bursaries');
    const now = new Date().toISOString();
    const newBursary = {
      awardName,
      adminUser,
      xmlString,
      createdBy: adminUser,
      editedBy: adminUser,
      createdDate: now,
      lastEditDate: now
    };
    const result = await bursaries.insertOne(newBursary);
    res.json({ id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /bursaries - return all bursaries
app.get('/bursaries', async (req, res) => {
  try {
    const db = await getDb();
    const bursaries = db.collection('bursaries');
    const all = await bursaries.find({}).toArray();
    // Map _id to id for frontend compatibility (as string)
    const mapped = all.map(b => ({ ...b, id: b._id.toString() }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /bursaries/:id - return a single bursary by id
app.get('/bursaries/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching bursary with id: ${id}`);
  try {
    const db = await getDb();
    const bursaries = db.collection('bursaries');
    const bursary = await bursaries.findOne({ _id: new ObjectId(id) });
    if (!bursary) {
      return res.status(404).json({ error: 'Bursary not found' });
    }
    // Map _id to id for frontend compatibility (as string)
    res.json({ ...bursary, id: bursary._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /bursaries/:id - update a bursary
app.put('/bursaries/:id', async (req, res) => {
  const { id } = req.params;
  const { awardName, adminUser, xmlString } = req.body;
  if (!awardName || !adminUser || !xmlString) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const db = await getDb();
    const bursaries = db.collection('bursaries');
    const now = new Date().toISOString();
    const updateResult = await bursaries.updateOne(
      { _id: new ObjectId(id) },
      { $set: {
          awardName,
          adminUser,
          xmlString,
          editedBy: adminUser,
          lastEditDate: now
        }
      }
    );
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Bursary not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
