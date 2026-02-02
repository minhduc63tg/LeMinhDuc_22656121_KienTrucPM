const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "product.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto = grpc.loadPackageDefinition(packageDefinition).product;

// Create gRPC client
const client = new productProto.ProductService(
  "localhost:50051",
  grpc.credentials.createInsecure(),
);

// Test functions
function testGetProducts() {
  return new Promise((resolve, reject) => {
    client.GetProducts({}, (error, response) => {
      if (error) {
        reject(error);
      } else {
        console.log("✅ GetProducts:", response);
        resolve(response);
      }
    });
  });
}

function testGetProduct(id) {
  return new Promise((resolve, reject) => {
    client.GetProduct({ id }, (error, response) => {
      if (error) {
        reject(error);
      } else {
        console.log(`✅ GetProduct(${id}):`, response);
        resolve(response);
      }
    });
  });
}

function testGetProductsByCategory(category) {
  return new Promise((resolve, reject) => {
    client.GetProductsByCategory({ category }, (error, response) => {
      if (error) {
        reject(error);
      } else {
        console.log(`✅ GetProductsByCategory(${category}):`, response);
        resolve(response);
      }
    });
  });
}

function testCreateProduct(product) {
  return new Promise((resolve, reject) => {
    client.CreateProduct(product, (error, response) => {
      if (error) {
        reject(error);
      } else {
        console.log("✅ CreateProduct:", response);
        resolve(response);
      }
    });
  });
}

function testGetOrderDetails(id) {
  return new Promise((resolve, reject) => {
    client.GetOrderDetails({ id }, (error, response) => {
      if (error) {
        reject(error);
      } else {
        console.log(`✅ GetOrderDetails(${id}):`, response);
        resolve(response);
      }
    });
  });
}

function testGetStats() {
  return new Promise((resolve, reject) => {
    client.GetStats({}, (error, response) => {
      if (error) {
        reject(error);
      } else {
        console.log("📊 Stats:", response);
        resolve(response);
      }
    });
  });
}

// Run tests
async function runTests() {
  console.log("========================================");
  console.log("🧪 Testing gRPC API");
  console.log("========================================\n");

  try {
    await testGetProducts();
    console.log("\n");

    await testGetProduct(1);
    console.log("\n");

    await testGetProductsByCategory("Electronics");
    console.log("\n");

    await testGetOrderDetails(1);
    console.log("\n");

    await testGetStats();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Export for use in other scripts
module.exports = {
  client,
  testGetProducts,
  testGetProduct,
  testGetProductsByCategory,
  testCreateProduct,
  testGetOrderDetails,
  testGetStats,
};

// Run if executed directly
if (require.main === module) {
  runTests();
}
