# HOMYA Shop - E-commerce Application

A full-stack e-commerce application built with React, Node.js, Express, and MongoDB.

## Features

- **Product Management**: Add, edit, and delete products with categories
- **Category System**: Filter products by categories (Bedroom, Living Room, Office, etc.)
- **Shopping Cart**: Add products to cart and manage quantities
- **User Authentication**: Consumer login/signup with profile management
- **Order Management**: Place orders and track order status
- **Admin Panel**: Complete admin interface for managing products and orders
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

- **Frontend**: React.js, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT-based authentication

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd newjsprajita
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start MongoDB**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # Or start manually
   mongod
   ```

4. **Initialize the database with sample data**
   ```bash
   cd backend
   node init-database.js
   ```

5. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:5001`

6. **Start the frontend application**
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## Database Structure

### Collections
- **products**: Product information with categories
- **consumers**: User accounts for customers
- **orders**: Order information and status
- **admins**: Admin user accounts

### Sample Data
The application comes with 15 sample products across different categories:
- **Bedroom**: Bed frames, wardrobes, dressing tables
- **Living Room**: Sofas, coffee tables, TV units, shelves
- **Office**: Desks, drawer units
- **Kitchen & Dining**: Kitchen carts

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/categories` - Get all unique categories
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Authentication
- `POST /api/consumer/signup` - Consumer registration
- `POST /api/consumer/login` - Consumer login
- `POST /api/admin/login` - Admin login

### Orders
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders?email=user@email.com` - Get user orders
- `POST /api/orders` - Create new order

## Usage

### For Consumers
1. Visit `http://localhost:3000`
2. Browse products by category
3. Add products to cart
4. Login/signup to complete purchase
5. View order history

### For Admins
1. Login at `http://localhost:3000/login`
2. Manage products (add, edit, delete)
3. View and update order status
4. Monitor sales and inventory

## Category System

The application includes a category filtering system:
- **All Products**: Shows all products
- **Bedroom**: Bed frames, wardrobes, storage
- **Living Room**: Sofas, tables, shelves, TV units
- **Office**: Desks, drawer units
- **Kitchen & Dining**: Kitchen carts and dining furniture

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 