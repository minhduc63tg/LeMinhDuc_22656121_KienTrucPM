// Mock Database (same as REST)
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

const root = {
  // Queries
  products: () => {
    console.log("[GraphQL] Query: products");
    return products;
  },

  product: ({ id }) => {
    console.log(`[GraphQL] Query: product(id: ${id})`);
    return products.find((p) => p.id === id);
  },

  productsByCategory: ({ category }) => {
    console.log(`[GraphQL] Query: productsByCategory(category: ${category})`);
    return products.filter((p) => p.category === category);
  },

  orders: () => {
    console.log("[GraphQL] Query: orders");
    return orders.map((order) => ({
      ...order,
      customer: () => customers.find((c) => c.id === order.customerId),
      product: () => products.find((p) => p.id === order.productId),
    }));
  },

  order: ({ id }) => {
    console.log(`[GraphQL] Query: order(id: ${id})`);
    const order = orders.find((o) => o.id === id);
    if (!order) return null;

    return {
      ...order,
      customer: () => customers.find((c) => c.id === order.customerId),
      product: () => products.find((p) => p.id === order.productId),
    };
  },

  customer: ({ id }) => {
    console.log(`[GraphQL] Query: customer(id: ${id})`);
    const customer = customers.find((c) => c.id === id);
    if (!customer) return null;

    return {
      ...customer,
      orders: () => orders.filter((o) => o.customerId === id),
    };
  },

  stats: () => ({
    api: "GraphQL",
    totalRequests: requestCount,
    averageResponseTime:
      requestCount > 0
        ? (totalResponseTime / requestCount).toFixed(2) + "ms"
        : "0ms",
  }),

  // Mutations
  createProduct: ({ name, price, category, stock, description }) => {
    const newProduct = {
      id: products.length + 1,
      name,
      price,
      category,
      stock,
      description,
    };
    products.push(newProduct);
    console.log("[GraphQL] Mutation: createProduct");
    return newProduct;
  },

  updateProduct: ({ id, name, price, category, stock, description }) => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...(name && { name }),
      ...(price && { price }),
      ...(category && { category }),
      ...(stock && { stock }),
      ...(description && { description }),
    };

    console.log("[GraphQL] Mutation: updateProduct");
    return products[index];
  },

  deleteProduct: ({ id }) => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return "Product not found";

    products.splice(index, 1);
    console.log("[GraphQL] Mutation: deleteProduct");
    return "Product deleted successfully";
  },
};

module.exports = { root, requestCount, totalResponseTime };
