const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
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
    return client.db('E_commerce');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

let db;

// Initialize database connection
connectToMongo().then((database) => {
  db = database;
  db.collection('products').createIndex({ name: 'text', description: 'text' });
  db.collection('customers').createIndex({ date: 1 });
  db.collection('customers').createIndex({ 'location': '2dsphere' });
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// CRUD operations for customers

app.post('/customers', async (req, res) => {
  try {
    const { name } = req.body;
    const existingCustomer = await db.collection('customers').findOne({ name });
    if (existingCustomer) {
      return res.status(400).json({ error: 'Customer with this name already exists' });
    }
    const result = await db.collection('customers').insertOne(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/customers', async (req, res) => {
  try {
    const customers = await db.collection('customers').find().toArray();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/customers/:name', async (req, res) => {
  try {
    const customer = await db.collection('customers').findOne({ name: req.params.name });
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/customers/:name', async (req, res) => {
  try {
    const result = await db.collection('customers').updateOne(
      { name: req.params.name },
      { $set: req.body }
    );
    if (result.matchedCount > 0) {
      res.json({ message: 'Customer updated successfully' });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/customers/:name', async (req, res) => {
  try {
    const result = await db.collection('customers').deleteOne({ name: req.params.name });
    if (result.deletedCount > 0) {
      res.json({ message: 'Customer deleted successfully' });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD operations for products

app.post('/products', async (req, res) => {
  try {
    const { name } = req.body;
    const existingProduct = await db.collection('products').findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ error: 'Product with this name already exists' });
    }
    const result = await db.collection('products').insertOne(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.get('/products', async (req, res) => {
  try {
    const products = await db.collection('products').find().toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/products/:name', async (req, res) => {
  try {
    const product = await db.collection('products').findOne({ name: req.params.name });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.put('/products/:name', async (req, res) => {
  try {
    const result = await db.collection('products').updateOne(
      { name: req.params.name },
      { $set: req.body }
    );
    if (result.matchedCount > 0) {
      res.json({ message: 'Product updated successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.delete('/products/:name', async (req, res) => {
  try {
    const result = await db.collection('products').deleteOne({ name: req.params.name });
    if (result.deletedCount > 0) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ANALYSIS ENDPOINTS

app.get('/analytics/top-products', async (req, res) => {
  try {
    const topProducts = await db.collection('customers').aggregate([
      { $unwind: '$products' },
      { $group: { _id: '$products.name', totalSold: { $sum: '$products.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]).toArray();
    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/analytics/sales', async (req, res) => {
  try {
    const { start, end } = req.query;
    const sales = await db.collection('customers').aggregate([
      { $match: { date: { $gte: new Date(start), $lte: new Date(end) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, totalSales: { $sum: '$total' } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/customers/nearby', async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.query;
    const nearbyCustomers = await db.collection('customers').find({
      'location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).toArray();
    res.json(nearbyCustomers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
