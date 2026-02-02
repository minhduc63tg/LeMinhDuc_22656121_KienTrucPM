const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mock Database
let products = [
  {
    id: 1,
    name: "Laptop Dell XPS",
    price: 25000000,
    category: "Electronics",
    stock: 50,
    description: "High-end laptop for professionals",
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    price: 30000000,
    category: "Electronics",
    stock: 100,
    description: "Latest iPhone model",
  },
  {
    id: 3,
    name: 'Samsung TV 55"',
    price: 15000000,
    category: "Electronics",
    stock: 30,
    description: "4K Smart TV",
  },
  {
    id: 4,
    name: "Nike Air Max",
    price: 3000000,
    category: "Fashion",
    stock: 200,
    description: "Popular sneakers",
  },
  {
    id: 5,
    name: "Adidas Ultraboost",
    price: 4000000,
    category: "Fashion",
    stock: 150,
    description: "Running shoes",
  },
];

let orders = [
  {
    id: 1,
    customerId: 1,
    productId: 1,
    quantity: 2,
    totalPrice: 50000000,
    status: "completed",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    customerId: 2,
    productId: 2,
    quantity: 1,
    totalPrice: 30000000,
    status: "pending",
    createdAt: new Date("2024-01-16"),
  },
  {
    id: 3,
    customerId: 1,
    productId: 4,
    quantity: 3,
    totalPrice: 9000000,
    status: "completed",
    createdAt: new Date("2024-01-17"),
  },
];

let customers = [
  { id: 1, name: "Nguyen Van A", email: "nva@gmail.com", phone: "0901234567" },
  { id: 2, name: "Tran Thi B", email: "ttb@gmail.com", phone: "0907654321" },
];

// Tracking cho performance comparison
let requestCount = 0;
let totalResponseTime = 0;

// Middleware để track performance
app.use((req, res, next) => {
  req.startTime = Date.now();
  requestCount++;

  res.on("finish", () => {
    const responseTime = Date.now() - req.startTime;
    totalResponseTime += responseTime;
    console.log(`[REST] ${req.method} ${req.path} - ${responseTime}ms`);
  });

  next();
});

// ============================================
// REST ENDPOINTS
// ============================================

// 1. GET all products
app.get("/api/products", (req, res) => {
  res.json({
    success: true,
    data: products,
    count: products.length,
  });
});

// 2. GET product by ID
app.get("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }
  res.json({ success: true, data: product });
});

// 3. GET products by category
app.get("/api/products/category/:category", (req, res) => {
  const filtered = products.filter((p) => p.category === req.params.category);
  res.json({ success: true, data: filtered, count: filtered.length });
});

// 4. GET all orders
app.get("/api/orders", (req, res) => {
  res.json({ success: true, data: orders, count: orders.length });
});

// 5. GET order with customer and product details (N+1 problem)
app.get("/api/orders/:id/details", (req, res) => {
  const order = orders.find((o) => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ success: false, error: "Order not found" });
  }

  // Multiple queries - N+1 problem!
  const customer = customers.find((c) => c.id === order.customerId);
  const product = products.find((p) => p.id === order.productId);

  res.json({
    success: true,
    data: {
      ...order,
      customer,
      product,
    },
  });
});

// 6. GET customer with all their orders (Over-fetching)
app.get("/api/customers/:id", (req, res) => {
  const customer = customers.find((c) => c.id === parseInt(req.params.id));
  if (!customer) {
    return res
      .status(404)
      .json({ success: false, error: "Customer not found" });
  }

  const customerOrders = orders.filter((o) => o.customerId === customer.id);

  // Over-fetching: Trả về toàn bộ dữ liệu dù client có thể chỉ cần name
  res.json({
    success: true,
    data: {
      ...customer,
      orders: customerOrders,
    },
  });
});

// 7. POST - Create new product
app.post("/api/products", (req, res) => {
  const newProduct = {
    id: products.length + 1,
    ...req.body,
  };
  products.push(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

// 8. PUT - Update product
app.put("/api/products/:id", (req, res) => {
  const index = products.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }

  products[index] = { ...products[index], ...req.body };
  res.json({ success: true, data: products[index] });
});

// 9. DELETE product
app.delete("/api/products/:id", (req, res) => {
  const index = products.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }

  products.splice(index, 1);
  res.json({ success: true, message: "Product deleted" });
});

// Stats endpoint
app.get("/api/stats", (req, res) => {
  res.json({
    api: "REST",
    totalRequests: requestCount,
    averageResponseTime:
      requestCount > 0
        ? (totalResponseTime / requestCount).toFixed(2) + "ms"
        : "0ms",
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ REST API running on http://localhost:${PORT}`);
  console.log("📊 Endpoints:");
  console.log("   GET    /api/products");
  console.log("   GET    /api/products/:id");
  console.log("   GET    /api/products/category/:category");
  console.log("   GET    /api/orders");
  console.log("   GET    /api/orders/:id/details");
  console.log("   GET    /api/customers/:id");
  console.log("   POST   /api/products");
  console.log("   PUT    /api/products/:id");
  console.log("   DELETE /api/products/:id");
});
