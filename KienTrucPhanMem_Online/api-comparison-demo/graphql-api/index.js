const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const cors = require("cors");
const schema = require("./schema");
const { root } = require("./resolvers");

const app = express();
app.use(cors());

let requestCount = 0;
let totalResponseTime = 0;

app.use("/graphql", (req, res, next) => {
  req.startTime = Date.now();
  requestCount++;

  res.on("finish", () => {
    const responseTime = Date.now() - req.startTime;
    totalResponseTime += responseTime;
    console.log(`[GraphQL] Request - ${responseTime}ms`);
  });

  next();
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // Enable GraphiQL UI
  }),
);

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`✅ GraphQL API running on http://localhost:${PORT}/graphql`);
  console.log("🎨 GraphiQL UI available at http://localhost:${PORT}/graphql");
});
