const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const port = 3000;

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
app.use(bodyParser.json());

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db("E_commerce");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

let db;

// Initialize database connection
connectToMongo().then((database) => {
  db = database;
  db.collection("products").createIndex({ name: "text", description: "text" });
  db.collection("customers").createIndex({ date: 1 });
  db.collection("customers").createIndex({ location: "2dsphere" });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description: "API for E-commerce application",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ["./index.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           example: 2023-07-01T10:00:00Z
 *         customer:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: John Doe
 *             email:
 *               type: string
 *               example: john.doe@example.com
 *             location:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: Point
 *                 coordinates:
 *                   type: array
 *                   items:
 *                     type: number
 *                   example: [-73.935242, 40.730610]
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Smartphone X
 *               quantity:
 *                 type: integer
 *                 example: 1
 *               price:
 *                 type: number
 *                 format: double
 *                 example: 999.99
 *         total:
 *           type: number
 *           format: double
 *           example: 999.99
 *     Product:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Smartphone X
 *         description:
 *           type: string
 *           example: Latest model with advanced features
 *         price:
 *           type: number
 *           format: double
 *           example: 999.99
 *         category:
 *           type: string
 *           example: Electronics
 */

/**
 * @swagger
 * tags:
 *   name: Basic CRUD
 *   description: Basic CRUD operations for customers and products
 */

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Basic CRUD]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 acknowledged:
 *                   type: boolean
 *                   example: true
 *                 insertedId:
 *                   type: string
 *                   example: 60f7a1a2a1a2a1a2a1a2a1a2
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Customer with this name already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
app.post("/customers", async (req, res) => {
  try {
    const { name } = req.body;
    const existingCustomer = await db.collection("customers").findOne({ name });
    if (existingCustomer) {
      return res
        .status(400)
        .json({ error: "Customer with this name already exists" });
    }
    const result = await db.collection("customers").insertOne(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Gets all customers
 *     tags: [Basic CRUD]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
app.get("/customers", async (req, res) => {
  try {
    const customers = await db.collection("customers").find().toArray();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/**
 * @swagger
 * /customers/{name}:
 *   get:
 *     summary: Gets a customer by name
 *     tags: [Basic CRUD]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the customer to retrieve
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

app.put("/customers/:name", async (req, res) => {
  try {
    const result = await db
      .collection("customers")
      .updateOne({ name: req.params.name }, { $set: req.body });
    if (result.matchedCount > 0) {
      res.json({ message: "Customer updated successfully" });
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /customers/{name}:
 *   delete:
 *     summary: Deletes a customer by name
 *     tags: [Basic CRUD]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the customer to delete
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer deleted successfully
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
app.delete("/customers/:name", async (req, res) => {
  try {
    const result = await db
      .collection("customers")
      .deleteOne({ name: req.params.name });
    if (result.deletedCount > 0) {
      res.json({ message: "Customer deleted successfully" });
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// CRUD operations for products

app.post("/products", async (req, res) => {
  try {
    const { name } = req.body;
    const existingProduct = await db.collection("products").findOne({ name });
    if (existingProduct) {
      return res
        .status(400)
        .json({ error: "Product with this name already exists" });
    }
    const result = await db.collection("products").insertOne(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/products/:name", async (req, res) => {
  try {
    const product = await db
      .collection("products")
      .findOne({ name: req.params.name });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/products/:name", async (req, res) => {
  try {
    const result = await db
      .collection("products")
      .updateOne({ name: req.params.name }, { $set: req.body });
    if (result.matchedCount > 0) {
      res.json({ message: "Product updated successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/products/:name", async (req, res) => {
  try {
    const result = await db
      .collection("products")
      .deleteOne({ name: req.params.name });
    if (result.deletedCount > 0) {
      res.json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ANALYSIS ENDPOINTS

app.get("/analytics/top-products", async (req, res) => {
  try {
    const topProducts = await db
      .collection("customers")
      .aggregate([
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.name",
            totalSold: { $sum: "$products.quantity" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ])
      .toArray();
    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/analytics/sales", async (req, res) => {
  try {
    const { start, end } = req.query;
    const sales = await db
      .collection("customers")
      .aggregate([
        { $match: { date: { $gte: new Date(start), $lte: new Date(end) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalSales: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/customers/nearby", async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.query;
    const nearbyCustomers = await db
      .collection("customers")
      .find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: parseInt(maxDistance),
          },
        },
      })
      .toArray();
    res.json(nearbyCustomers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
