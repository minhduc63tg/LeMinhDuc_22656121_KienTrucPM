const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type Product {
    id: Int!
    name: String!
    price: Int!
    category: String!
    stock: Int!
    description: String
  }

  type Order {
    id: Int!
    customerId: Int!
    productId: Int!
    quantity: Int!
    totalPrice: Int!
    status: String!
    createdAt: String!
    customer: Customer
    product: Product
  }

  type Customer {
    id: Int!
    name: String!
    email: String!
    phone: String!
    orders: [Order]
  }

  type Stats {
    api: String!
    totalRequests: Int!
    averageResponseTime: String!
  }

  type Query {
    products: [Product]
    product(id: Int!): Product
    productsByCategory(category: String!): [Product]
    orders: [Order]
    order(id: Int!): Order
    customer(id: Int!): Customer
    stats: Stats
  }

  type Mutation {
    createProduct(name: String!, price: Int!, category: String!, stock: Int!, description: String): Product
    updateProduct(id: Int!, name: String, price: Int, category: String, stock: Int, description: String): Product
    deleteProduct(id: Int!): String
  }
`);

module.exports = schema;
