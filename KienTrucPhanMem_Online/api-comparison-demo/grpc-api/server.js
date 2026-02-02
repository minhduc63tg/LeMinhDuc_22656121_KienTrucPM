const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Load proto file
const PROTO_PATH = path.join(__dirname, "product.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto = grpc.loadPackageDefinition(packageDefinition).product;

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
    createdAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: 2,
    customerId: 2,
    productId: 2,
    quantity: 1,
    totalPrice: 30000000,
    status: "pending",
    createdAt: new Date("2024-01-16").toISOString(),
  },
  {
    id: 3,
    customerId: 1,
    productId: 4,
    quantity: 3,
    totalPrice: 9000000,
    status: "completed",
    createdAt: new Date("2024-01-17").toISOString(),
  },
];

let customers = [
  { id: 1, name: "Nguyen Van A", email: "nva@gmail.com", phone: "0901234567" },
  { id: 2, name: "Tran Thi B", email: "ttb@gmail.com", phone: "0907654321" },
];

let requestCount = 0;
let totalResponseTime = 0;

// gRPC Service Implementation
const productService = {
  GetProducts: (call, callback) => {
    const start = Date.now();
    console.log("[gRPC] GetProducts called");

    callback(null, {
      products: products,
      count: products.length,
    });

    const responseTime = Date.now() - start;
    requestCount++;
    totalResponseTime += responseTime;
    console.log(`[gRPC] GetProducts - ${responseTime}ms`);
  },

  GetProduct: (call, callback) => {
    const start = Date.now();
    console.log(`[gRPC] GetProduct called with id: ${call.request.id}`);

    const product = products.find((p) => p.id === call.request.id);

    if (!product) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: "Product not found",
      });
    } else {
      callback(null, product);
    }

    const responseTime = Date.now() - start;
    requestCount++;
    totalResponseTime += responseTime;
    console.log(`[gRPC] GetProduct - ${responseTime}ms`);
  },

  GetProductsByCategory: (call, callback) => {
    const start = Date.now();
    console.log(`[gRPC] GetProductsByCategory: ${call.request.category}`);

    const filtered = products.filter(
      (p) => p.category === call.request.category,
    );
    callback(null, {
      products: filtered,
      count: filtered.length,
    });

    const responseTime = Date.now() - start;
    requestCount++;
    totalResponseTime += responseTime;
    console.log(`[gRPC] GetProductsByCategory - ${responseTime}ms`);
  },

  CreateProduct: (call, callback) => {
    const start = Date.now();
    console.log("[gRPC] CreateProduct called");

    const newProduct = {
      id: products.length + 1,
      ...call.request,
    };
    products.push(newProduct);
    callback(null, newProduct);

    const responseTime = Date.now() - start;
    requestCount++;
    totalResponseTime += responseTime;
    console.log(`[gRPC] CreateProduct - ${responseTime}ms`);
  },

  UpdateProduct: (call, callback) => {
    const start = Date.now();
    console.log(`[gRPC] UpdateProduct: ${call.request.id}`);

    const index = products.findIndex((p) => p.id === call.request.id);
    if (index === -1) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: "Product not found",
      });
    } else {
      products[index] = { ...products[index], ...call.request };
      callback(null, products[index]);
    }

    const responseTime = Date.now() - start;
    requestCount++;
    totalResponseTime += responseTime;
    console.log(`[gRPC] UpdateProduct - ${responseTime}ms`);
  },

  DeleteProduct: (call, callback) => {
    const start = Date.now();
    console.log(`[gRPC] DeleteProduct: ${call.request.id}`);

    const index = products.findIndex((p) => p.id === call.request.id);
    if (index === -1) {
      callback(null, { success: false, message: "Product not found" });
    } else {
      products.splice(index, 1);
      callback(null, { success: true, message: "Product deleted" });
    }

    const responseTime = Date.now() - start;
    requestCount++;
    totalResponseTime += responseTime;
    console.log(`[gRPC] DeleteProduct - ${responseTime}ms`);
  },

  GetOrders: (call, callback) => {
    const start = Date.now();
    console.log("[gRPC] GetOrders called");

    callback(null, {
      orders: orders,
      count: orders.length,
    });

    const responseTime = Date.now() - start;
    requestCount++;
    totalResponseTime += responseTime;
  },

  GetOrderDetails: (call, callback) => {
    const start = Date.now();
    console.log(`[gRPC] GetOrderDetails: ${call.request.id}`);

    const order = orders.find((o) => o.id === call.request.id);
    if (!order) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: "Order not found",
      });
      return;
    }

    const customer = customers.find((c) => c.id === order.customerId);
    const product = products.find((p) => p.id === order.productId);

    callback(null, {
      ...order,
      customer,
      product,
    });

    const responseTime = Date.now() - start;
    requestCount++;
    totalResponseTime += responseTime;
    console.log(`[gRPC] GetOrderDetails - ${responseTime}ms`);
  },

  GetCustomer: (call, callback) => {
    const start = Date.now();
    console.log(`[gRPC] GetCustomer: ${call.request.id}`);

    const customer = customers.find((c) => c.id === call.request.id);
    if (!customer) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: "Customer not found",
      });
      return;
    }

    const customerOrders = orders.filter((o) => o.customerId === customer.id);

    callback(null, {
      ...customer,
      orders: customerOrders,
    });

    const responseTime = Date.now() - start;
    requestCount++;
    totalResponseTime += responseTime;
    console.log(`[gRPC] GetCustomer - ${responseTime}ms`);
  },

  GetStats: (call, callback) => {
    callback(null, {
      api: "gRPC",
      totalRequests: requestCount,
      averageResponseTime:
        requestCount > 0
          ? (totalResponseTime / requestCount).toFixed(2) + "ms"
          : "0ms",
    });
  },
};

// Start gRPC Server
const server = new grpc.Server();
server.addService(productProto.ProductService.service, productService);

const PORT = "0.0.0.0:50051";
server.bindAsync(
  PORT,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("Failed to start gRPC server:", error);
      return;
    }
    console.log(`✅ gRPC Server running on ${PORT}`);
    console.log("📡 Services available:");
    console.log("   - GetProducts");
    console.log("   - GetProduct");
    console.log("   - GetProductsByCategory");
    console.log("   - CreateProduct");
    console.log("   - UpdateProduct");
    console.log("   - DeleteProduct");
    console.log("   - GetOrders");
    console.log("   - GetOrderDetails");
    console.log("   - GetCustomer");
    server.start();
  },
);
