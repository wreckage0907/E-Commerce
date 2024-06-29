const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

app.use(bodyParser.json());

async function connectToMongo() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('ecommerce_analytics');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

let db;

// Initialize database connection
connectToMongo().then((database) => {
  db = database;
  
  // Create indexes
  db.collection('products').createIndex({ name: 'text', description: 'text' });
  db.collection('orders').createIndex({ date: 1 });
  db.collection('orders').createIndex({ 'customer.location': '2dsphere' });
});


app.get('/', (req, res) => {
    res.send('Hello World!');
    });
// Record a new order
app.post('/orders', async (req, res) => {
  try {
    const result = await db.collection('orders').insertOne(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get top selling products
app.get('/analytics/top-products', async (req, res) => {
  try {
    const topProducts = await db.collection('orders').aggregate([
      { $unwind: '$products' },
      { $group: { _id: '$products.id', totalSold: { $sum: '$products.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]).toArray();
    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search products
app.get('/products/search', async (req, res) => {
  try {
    const { query } = req.query;
    const products = await db.collection('products').find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales by date range
app.get('/analytics/sales', async (req, res) => {
  try {
    const { start, end } = req.query;
    const sales = await db.collection('orders').aggregate([
      { $match: { date: { $gte: new Date(start), $lte: new Date(end) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, totalSales: { $sum: '$total' } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find nearby orders
app.get('/orders/nearby', async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.query;
    const nearbyOrders = await db.collection('orders').find({
      'customer.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).toArray();
    res.json(nearbyOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});