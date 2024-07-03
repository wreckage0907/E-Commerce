const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const bcrypt = require('bcrypt');

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
  db.collection("auth").createIndex({ username: 1 }, { unique: true });
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
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
app.post('/auth/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await db.collection('auth').findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    await db.collection('auth').insertOne(newUser);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid username or password
 *       500:
 *         description: Server error
 */
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.collection('auth').findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


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
 *   put:
 *     summary: Updates a customer by name
 *     tags: [Basic CRUD]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the customer to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer updated successfully
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

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Basic CRUD]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
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
 *                   example: Product with this name already exists
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
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Gets all products
 *     tags: [Basic CRUD]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
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
app.get("/products", async (req, res) => {
  try {
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /products/{name}:
 *   get:
 *     summary: Gets a product by name
 *     tags: [Basic CRUD]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product to retrieve
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
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

/**
 * @swagger
 * /products/{name}:
 *   put:
 *     summary: Updates a product by name
 *     tags: [Basic CRUD]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
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
 *                   example: Product updated successfully
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
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

/**
 * @swagger
 * /products/{name}:
 *   delete:
 *     summary: Deletes a product by name
 *     tags: [Basic CRUD]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product to delete
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
 *                   example: Product deleted successfully
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
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

/**
 * @swagger
 * tags:
 *   name: Analysis
 *   description: Endpoints for analytics
 */
// ANALYSIS ENDPOINTS

/**
 * @swagger
 * /analytics/top-products:
 *   get:
 *     summary: Get top 5 products by quantity sold
 *     tags: [Analysis]
 *     responses:
 *       200:
 *         description: A list of top 5 products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: Smartphone X
 *                   totalSold:
 *                     type: integer
 *                     example: 150
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

/**
 * @swagger
 * /analytics/sales:
 *   get:
 *     summary: Get total sales between two dates
 *     tags: [Analysis]
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date in YYYY-MM-DD format
 *         required: true
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *         description: End date in YYYY-MM-DD format
 *         required: true
 *     responses:
 *       200:
 *         description: A list of total sales grouped by date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 2023-07-01
 *                   totalSales:
 *                     type: number
 *                     format: double
 *                     example: 999.99
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
/**
 * @swagger
 * /analytics/product-sales:
 *   get:
 *     summary: Get total sales of a specific product over time
 *     tags: [Analysis]
 *     parameters:
 *       - in: query
 *         name: productName
 *         schema:
 *           type: string
 *         description: Name of the product
 *         required: true
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date in YYYY-MM-DD format
 *         required: true
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *         description: End date in YYYY-MM-DD format
 *         required: true
 *     responses:
 *       200:
 *         description: A list of total sales for the specified product grouped by date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 2023-07-01
 *                   totalSales:
 *                     type: number
 *                     format: double
 *                     example: 1999.98
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
app.get("/analytics/product-sales", async (req, res) => {
  try {
    const { productName, start, end } = req.query;
    const sales = await db
      .collection("customers")
      .aggregate([
        { $unwind: "$products" },
        { $match: { "products.name": productName, date: { $gte: new Date(start), $lte: new Date(end) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalSales: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
