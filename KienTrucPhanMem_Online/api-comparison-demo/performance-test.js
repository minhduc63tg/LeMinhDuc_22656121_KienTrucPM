const axios = require("axios");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Setup gRPC client
const PROTO_PATH = path.join(__dirname, "grpc-api", "product.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(packageDefinition).product;
const grpcClient = new productProto.ProductService(
  "localhost:50051",
  grpc.credentials.createInsecure(),
);

// Test configuration
const NUM_REQUESTS = 100;

// Colors for console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
};

// ============================================
// REST API Tests
// ============================================
async function testRESTPerformance() {
  console.log(
    `${colors.blue}🔵 Testing REST API Performance...${colors.reset}`,
  );

  const results = {
    getProducts: [],
    getProductById: [],
    getOrderDetails: [],
    getCustomer: [],
  };

  // Test 1: Get all products
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = Date.now();
    try {
      await axios.get("http://localhost:3001/api/products");
      results.getProducts.push(Date.now() - start);
    } catch (error) {
      console.error("REST Error:", error.message);
    }
  }

  // Test 2: Get product by ID
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = Date.now();
    try {
      await axios.get(`http://localhost:3001/api/products/${(i % 5) + 1}`);
      results.getProductById.push(Date.now() - start);
    } catch (error) {
      console.error("REST Error:", error.message);
    }
  }

  // Test 3: Get order details (N+1 problem)
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = Date.now();
    try {
      await axios.get(
        `http://localhost:3001/api/orders/${(i % 3) + 1}/details`,
      );
      results.getOrderDetails.push(Date.now() - start);
    } catch (error) {
      console.error("REST Error:", error.message);
    }
  }

  // Test 4: Get customer (Over-fetching)
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = Date.now();
    try {
      await axios.get(`http://localhost:3001/api/customers/${(i % 2) + 1}`);
      results.getCustomer.push(Date.now() - start);
    } catch (error) {
      console.error("REST Error:", error.message);
    }
  }

  return calculateStats("REST", results);
}

// ============================================
// GraphQL API Tests
// ============================================
async function testGraphQLPerformance() {
  console.log(
    `${colors.green}🟢 Testing GraphQL API Performance...${colors.reset}`,
  );

  const results = {
    getProducts: [],
    getProductById: [],
    getOrderDetails: [],
    getCustomer: [],
  };

  const graphqlEndpoint = "http://localhost:3002/graphql";

  // Test 1: Get all products (only fetch needed fields)
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = Date.now();
    try {
      await axios.post(graphqlEndpoint, {
        query: `
          query {
            products {
              id
              name
              price
            }
          }
        `,
      });
      results.getProducts.push(Date.now() - start);
    } catch (error) {
      console.error("GraphQL Error:", error.message);
    }
  }

  // Test 2: Get product by ID
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = Date.now();
    const productId = (i % 5) + 1;
    try {
      await axios.post(graphqlEndpoint, {
        query: `
          query {
            product(id: ${productId}) {
              id
              name
              price
              category
            }
          }
        `,
      });
      results.getProductById.push(Date.now() - start);
    } catch (error) {
      console.error("GraphQL Error:", error.message);
    }
  }

  // Test 3: Get order details (single query - NO N+1!)
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = Date.now();
    const orderId = (i % 3) + 1;
    try {
      await axios.post(graphqlEndpoint, {
        query: `
          query {
            order(id: ${orderId}) {
              id
              quantity
              totalPrice
              customer {
                name
                email
              }
              product {
                name
                price
              }
            }
          }
        `,
      });
      results.getOrderDetails.push(Date.now() - start);
    } catch (error) {
      console.error("GraphQL Error:", error.message);
    }
  }

  // Test 4: Get customer (only needed fields - NO over-fetching!)
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = Date.now();
    const customerId = (i % 2) + 1;
    try {
      await axios.post(graphqlEndpoint, {
        query: `
          query {
            customer(id: ${customerId}) {
              name
              email
            }
          }
        `,
      });
      results.getCustomer.push(Date.now() - start);
    } catch (error) {
      console.error("GraphQL Error:", error.message);
    }
  }

  return calculateStats("GraphQL", results);
}

// ============================================
// gRPC API Tests
// ============================================
async function testGRPCPerformance() {
  console.log(
    `${colors.yellow}🟡 Testing gRPC API Performance...${colors.reset}`,
  );

  const results = {
    getProducts: [],
    getProductById: [],
    getOrderDetails: [],
    getCustomer: [],
  };

  // Test 1: Get all products
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = Date.now();
    await new Promise((resolve, reject) => {
      grpcClient.GetProducts({}, (error, response) => {
        if (error) reject(error);
        else {
          results.getProducts.push(Date.now() - start);
          resolve(response);
        }
      });
    });
  }

  // Test 2: Get product by ID
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = Date.now();
    const productId = (i % 5) + 1;
    await new Promise((resolve, reject) => {
      grpcClient.GetProduct({ id: productId }, (error, response) => {
        if (error) reject(error);
        else {
          results.getProductById.push(Date.now() - start);
          resolve(response);
        }
      });
    });
  }

  // Test 3: Get order details
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = Date.now();
    const orderId = (i % 3) + 1;
    await new Promise((resolve, reject) => {
      grpcClient.GetOrderDetails({ id: orderId }, (error, response) => {
        if (error) reject(error);
        else {
          results.getOrderDetails.push(Date.now() - start);
          resolve(response);
        }
      });
    });
  }

  // Test 4: Get customer
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = Date.now();
    const customerId = (i % 2) + 1;
    await new Promise((resolve, reject) => {
      grpcClient.GetCustomer({ id: customerId }, (error, response) => {
        if (error) reject(error);
        else {
          results.getCustomer.push(Date.now() - start);
          resolve(response);
        }
      });
    });
  }

  return calculateStats("gRPC", results);
}

// ============================================
// Calculate Statistics
// ============================================
function calculateStats(apiName, results) {
  const stats = {};

  for (const [testName, times] of Object.entries(results)) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const sorted = [...times].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    stats[testName] = {
      avg: avg.toFixed(2),
      min,
      max,
      p95,
      p99,
    };
  }

  return { apiName, stats };
}

// ============================================
// Display Results
// ============================================
function displayResults(results) {
  console.log("\n");
  console.log("========================================");
  console.log("📊 PERFORMANCE COMPARISON RESULTS");
  console.log("========================================\n");

  const testNames = [
    "getProducts",
    "getProductById",
    "getOrderDetails",
    "getCustomer",
  ];
  const testLabels = {
    getProducts: "Get All Products",
    getProductById: "Get Product by ID",
    getOrderDetails: "Get Order Details (with relations)",
    getCustomer: "Get Customer (with orders)",
  };

  testNames.forEach((testName) => {
    console.log(`\n${colors.blue}${testLabels[testName]}${colors.reset}`);
    console.log("─".repeat(60));
    console.log(
      "API      | Avg (ms) | Min (ms) | Max (ms) | P95 (ms) | P99 (ms)",
    );
    console.log("─".repeat(60));

    results.forEach((result) => {
      const stat = result.stats[testName];
      const color =
        result.apiName === "REST"
          ? colors.blue
          : result.apiName === "GraphQL"
            ? colors.green
            : colors.yellow;

      console.log(
        `${color}${result.apiName.padEnd(8)}${colors.reset} | ` +
          `${stat.avg.padStart(8)} | ` +
          `${stat.min.toString().padStart(8)} | ` +
          `${stat.max.toString().padStart(8)} | ` +
          `${stat.p95.toString().padStart(8)} | ` +
          `${stat.p99.toString().padStart(8)}`,
      );
    });
  });

  console.log("\n");
  displayWinner(results);
}

// ============================================
// Display Winner
// ============================================
function displayWinner(results) {
  console.log("🏆 WINNERS BY CATEGORY:\n");

  const testNames = [
    "getProducts",
    "getProductById",
    "getOrderDetails",
    "getCustomer",
  ];
  const testLabels = {
    getProducts: "Get All Products",
    getProductById: "Get Product by ID",
    getOrderDetails: "Get Order Details",
    getCustomer: "Get Customer",
  };

  testNames.forEach((testName) => {
    const winner = results.reduce((prev, curr) => {
      const prevAvg = parseFloat(prev.stats[testName].avg);
      const currAvg = parseFloat(curr.stats[testName].avg);
      return prevAvg < currAvg ? prev : curr;
    });

    const color =
      winner.apiName === "REST"
        ? colors.blue
        : winner.apiName === "GraphQL"
          ? colors.green
          : colors.yellow;

    console.log(
      `${testLabels[testName]}: ${color}${winner.apiName}${colors.reset} (${winner.stats[testName].avg}ms avg)`,
    );
  });

  console.log("\n");
}

// ============================================
// Main Function
// ============================================
async function runPerformanceTests() {
  console.log(`\n${"=".repeat(60)}`);
  console.log("🚀 API PERFORMANCE COMPARISON TEST");
  console.log(`Running ${NUM_REQUESTS} requests per test...`);
  console.log(`${"=".repeat(60)}\n`);

  try {
    const restResults = await testRESTPerformance();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s

    const graphqlResults = await testGraphQLPerformance();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s

    const grpcResults = await testGRPCPerformance();

    displayResults([restResults, graphqlResults, grpcResults]);

    // Save results to file
    const fs = require("fs");
    fs.writeFileSync(
      "performance-results.json",
      JSON.stringify([restResults, graphqlResults, grpcResults], null, 2),
    );
    console.log("✅ Results saved to performance-results.json\n");
  } catch (error) {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
  }

  process.exit(0);
}

// Run tests
runPerformanceTests();
