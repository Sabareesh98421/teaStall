import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import { PrismaClient } from "@prismaClient"
const pc = new PrismaClient();

async function prismaSchema() {
  try {

    let createData = await pc.tea.create({
      data: {
        name: "tea",
        price: 20
      }
    })
    return `Created tea with ID: ${createData.id}`;
  }
  catch (error) {
    console.error("Error creating tea:", error);
    return "Error creating tea";
  }
}


const app = new Elysia()
  .use(
    cors(
      {
        origin: "http://localhost:4200",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposeHeaders: ["Content-Length", "X-Total-Count"],
        credentials: true,
        maxAge: 3600,
      }
    ));

app.get("/", () => {
  prismaSchema().then((result) => {
    console.log(result);
  }).catch((error) => {
    console.error("Error in prismaSchema:", error);
  });
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

