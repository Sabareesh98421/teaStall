import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import { PrismaClient } from "@prismaClient"
const pc = new PrismaClient();

async function prismaSchema() {
  let createData = await pc.tea.create({
    data: {
      name: "tea",
      price: 20
    }
  })
  return `Created tea with ID: ${createData.id}`;
}

console.log(prismaSchema())
const app = new Elysia()
  .use(
    cors(
      {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposeHeaders: ["Content-Length", "X-Total-Count"],
        credentials: true,
        maxAge: 3600,
      }
    ));

app.get("/", () => {
  return { welcome: "Hello Elysia" }

})
app.get("/product", async () => { 
  const products = await pc.tea.findMany();
  return products;
});
app.listen(10108, (server) => {
  console.log(
    `🦊 Elysia is running at ${server.hostname}:${server.port}`
  );

});

