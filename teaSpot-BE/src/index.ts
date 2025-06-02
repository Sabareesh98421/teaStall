import { Elysia } from "elysia";
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
const app = new Elysia().get("/", () => "Hello Elysia").listen(10108);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
