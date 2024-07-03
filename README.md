# E-commerce Analysis System

This project implements an E-commerce Analysis System using Node.js, Express, and MongoDB. It provides a RESTful API for managing customers and products, as well as endpoints for analyzing sales data.

## Problem Statement

The E-commerce Analysis System aims to provide a backend solution for managing and analyzing e-commerce data. It allows for basic CRUD operations on customers and products, user authentication, and generates insights such as top-selling products and sales trends over time.

## Prerequisites

- Node.js (v14 or later)
- MongoDB (v4 or later)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/wreckage0907/E-Commerce.git
   cd E-Commerce
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up MongoDB:
   - Ensure MongoDB is running on your machine
   - The application will connect to `mongodb://localhost:27017` by default

## Running the Application

1. Start the server:
   ```
   node index.js
   ```

2. The server will start running on `http://localhost:3000`

3. Access the Swagger documentation at `http://localhost:3000/api-docs`

## Features

- User Authentication (signup and login)
- CRUD operations for customers and products
- Analytics endpoints for sales data and top products
- API documentation using Swagger

## API Documentation

For detailed information about the available endpoints and their usage, please refer to the [DOCS.md](DOCS.md) file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
