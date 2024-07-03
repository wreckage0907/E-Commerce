# API Documentation

This document provides details about the endpoints available in the E-commerce Analysis System.

## Authentication

### Sign Up

- **URL:** `/auth/signup`
- **Method:** POST
- **Description:** Register a new user
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Responses:**
  - 201: User created successfully
  - 400: User already exists
  - 500: Server error

### Login

- **URL:** `/auth/login`
- **Method:** POST
- **Description:** Login a user
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Responses:**
  - 200: Login successful
  - 400: Invalid username or password
  - 500: Server error

## Customers

### Create Customer

- **URL:** `/customers`
- **Method:** POST
- **Description:** Create a new customer
- **Request Body:** Customer object
- **Responses:**
  - 201: Created
  - 500: Internal server error

### Get All Customers

- **URL:** `/customers`
- **Method:** GET
- **Description:** Get all customers
- **Responses:**
  - 200: Success (Returns array of customers)
  - 500: Internal server error

### Update Customer

- **URL:** `/customers/{name}`
- **Method:** PUT
- **Description:** Update a customer by name
- **Request Body:** Updated customer object
- **Responses:**
  - 200: Customer updated successfully
  - 404: Customer not found
  - 500: Internal server error

### Delete Customer

- **URL:** `/customers/{name}`
- **Method:** DELETE
- **Description:** Delete a customer by name
- **Responses:**
  - 200: Customer deleted successfully
  - 404: Customer not found
  - 500: Internal server error

## Products

### Create Product

- **URL:** `/products`
- **Method:** POST
- **Description:** Create a new product
- **Request Body:** Product object
- **Responses:**
  - 201: Created
  - 400: Product with this name already exists
  - 500: Internal server error

### Get All Products

- **URL:** `/products`
- **Method:** GET
- **Description:** Get all products
- **Responses:**
  - 200: Success (Returns array of products)
  - 500: Internal server error

### Get Product by Name

- **URL:** `/products/{name}`
- **Method:** GET
- **Description:** Get a product by name
- **Responses:**
  - 200: Success (Returns product object)
  - 404: Product not found
  - 500: Internal server error

### Update Product

- **URL:** `/products/{name}`
- **Method:** PUT
- **Description:** Update a product by name
- **Request Body:** Updated product object
- **Responses:**
  - 200: Product updated successfully
  - 404: Product not found
  - 500: Internal server error

### Delete Product

- **URL:** `/products/{name}`
- **Method:** DELETE
- **Description:** Delete a product by name
- **Responses:**
  - 200: Product deleted successfully
  - 404: Product not found
  - 500: Internal server error

## Analytics

### Top Products

- **URL:** `/analytics/top-products`
- **Method:** GET
- **Description:** Get top 5 products by quantity sold
- **Responses:**
  - 200: Success (Returns array of top products)
  - 500: Internal server error

### Sales Analysis

- **URL:** `/analytics/sales`
- **Method:** GET
- **Description:** Get total sales between two dates
- **Query Parameters:**
  - start: Start date (YYYY-MM-DD)
  - end: End date (YYYY-MM-DD)
- **Responses:**
  - 200: Success (Returns array of sales data)
  - 500: Internal server error

### Product Sales Analysis

- **URL:** `/analytics/product-sales`
- **Method:** GET
- **Description:** Get total sales of a specific product over time
- **Query Parameters:**
  - productName: Name of the product
  - start: Start date (YYYY-MM-DD)
  - end: End date (YYYY-MM-DD)
- **Responses:**
  - 200: Success (Returns array of product sales data)
  - 500: Internal server error

For more detailed information about request and response schemas, please refer to the Swagger documentation available at `/api-docs` when the server is running.
