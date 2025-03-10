export const USERS = [
  {
    id: 1,
    email: "chamith88@gmail.com",
    name: "Chamith",
    password: "$2b$10$WZ/4XVh3PY4Ce7y/t/F8veJEXKGfYyJ2.lhHpIeDe3nJtmKeMKqpi",
  },
  {
    id: 2,
    email: "samantha90@gmail.com",
    name: "Samantha",
    password: "$2b$10$WZ/4XVh3PY4Ce7y/t/F8veJEXKGfYyJ2.lhHpIeDe3nJtmKeMKqpi",
  },
  {
    id: 3,
    email: "johnsmith@gmail.com",
    name: "John",
    password: "$2b$10$WZ/4XVh3PY4Ce7y/t/F8veJEXKGfYyJ2.lhHpIeDe3nJtmKeMKqpi",
  },
  {
    id: 4,
    email: "emilydoe@gmail.com",
    name: "Emily",
    password: "$2b$10$WZ/4XVh3PY4Ce7y/t/F8veJEXKGfYyJ2.lhHpIeDe3nJtmKeMKqpi",
  },
  {
    id: 5,
    email: "alexriley@gmail.com",
    name: "Alex",
    password: "$2b$10$WZ/4XVh3PY4Ce7y/t/F8veJEXKGfYyJ2.lhHpIeDe3nJtmKeMKqpi",
  },
];

export const BAKERIES = [
  {
    id: 1,
    name: "John's Bakery",
    managerId: 1,
    latitude: 6.924575,
    longitude: 79.987234,
  },
];

export const MANAGERS = [
  {
    id: 1,
    userId: 1,
  },
];

export const EMPLOYEES = [
  {
    id: 1,
    userId: 1,
    bakeryId: 1,
  },
  {
    id: 5,
    userId: 2,
    bakeryId: 1,
  },
  {
    id: 8,
    userId: 3,
    bakeryId: 1,
  },
  {
    id: 12,
    userId: 4,
    bakeryId: 1,
  },
  {
    id: 13,
    userId: 5,
  },
];

export const PRODUCTS = [
  {
    id: 1,
    name: "Bread",
    price: 130,
    stock: 20,
    sold: 5,
    bakeryId: 1,
    userId: 1,
  },
  {
    id: 2,
    name: "Croissant",
    price: 140,
    stock: 25,
    sold: 8,
    bakeryId: 1,
    userId: 1,
  },
  {
    id: 3,
    name: "Baguette",
    price: 120,
    stock: 30,
    sold: 7,
    bakeryId: 1,
    userId: 1,
  },
  {
    id: 4,
    name: "Danish Pastry",
    price: 150,
    stock: 18,
    sold: 9,
    bakeryId: 1,
    userId: 2,
  },
  {
    id: 5,
    name: "Muffin",
    price: 160,
    stock: 22,
    sold: 11,
    bakeryId: 1,
    userId: 2,
  },
  {
    id: 6,
    name: "Cheesecake",
    price: 135,
    stock: 15,
    sold: 6,
    bakeryId: 1,
    userId: 3,
  },
  {
    id: 7,
    name: "Donut",
    price: 145,
    stock: 12,
    sold: 8,
    bakeryId: 1,
    userId: 3,
  },
  {
    id: 8,
    name: "Bagel",
    price: 110,
    stock: 28,
    sold: 4,
    bakeryId: 1,
    userId: 4,
  },
  {
    id: 9,
    name: "Cinnamon Roll",
    price: 155,
    stock: 20,
    sold: 10,
    bakeryId: null,
    userId: 5,
  },
  {
    id: 10,
    name: "Brownie",
    price: 125,
    stock: 24,
    sold: 7,
    bakeryId: null,
    userId: 5,
  },
];

export const ORDERS = [
  {
    id: 1,
    price: 130,
    sold: 6,
    name: "Bread",
    seller: 1,
    bakeryId: 1,
    createdAt: "2025-03-08T15:04:24.287Z",
    latitude: 6.925097,
    longitude: 79.986655,
    productId: 1,
  },
  {
    id: 2,
    price: 130,
    sold: 6,
    name: "Bread",
    seller: 1,
    bakeryId: 1,
    createdAt: "2025-03-07T15:04:24.287Z",
    latitude: 6.92553,
    longitude: 79.986789,
    productId: 1,
  },
  {
    id: 3,
    price: 130,
    sold: 6,
    name: "Bread",
    seller: 1,
    bakeryId: 1,
    createdAt: "2025-03-06T15:04:24.287Z",
    latitude: 6.926317,
    longitude: 79.986481,
    productId: 1,
  },
  {
    id: 4,
    price: 140,
    sold: 4,
    name: "Croissant",
    seller: 1,
    bakeryId: 1,
    createdAt: "2025-03-05T15:04:24.287Z",
    latitude: 6.927027,
    longitude: 79.9871,
    productId: 2,
  },
  {
    id: 5,
    price: 140,
    sold: 4,
    name: "Croissant",
    seller: 1,
    bakeryId: 1,
    createdAt: "2025-03-04T15:04:24.287Z",
    latitude: 6.924157,
    longitude: 79.986713,
    productId: 2,
  },
  {
    id: 6,
    price: 140,
    sold: 4,
    name: "Croissant",
    seller: 1,
    bakeryId: 1,
    createdAt: "2025-03-03T15:04:24.287Z",
    latitude: 6.923851,
    longitude: 79.986812,
    productId: 2,
  },
  {
    id: 7,
    price: 120,
    sold: 5,
    name: "Baguette",
    seller: 1,
    bakeryId: 1,
    createdAt: "2025-03-02T15:04:24.287Z",
    latitude: 6.923437,
    longitude: 79.986885,
    productId: 3,
  },
  {
    id: 8,
    price: 120,
    sold: 5,
    name: "Baguette",
    seller: 1,
    bakeryId: 1,
    createdAt: "2025-03-01T15:04:24.287Z",
    latitude: 6.92331,
    longitude: 79.987133,
    productId: 3,
  },
  {
    id: 9,
    price: 150,
    sold: 3,
    name: "Danish Pastry",
    seller: 1,
    bakeryId: 1,
    createdAt: "2025-02-28T15:04:24.287Z",
    latitude: 6.924857,
    longitude: 79.988591,
    productId: 4,
  },
  {
    id: 10,
    price: 150,
    sold: 3,
    name: "Danish Pastry",
    seller: 1,
    bakeryId: 1,
    createdAt: "2025-02-27T15:04:24.287Z",
    latitude: 6.925056,
    longitude: 79.989267,
    productId: 4,
  },
  {
    id: 11,
    price: 160,
    sold: 7,
    name: "Muffin",
    seller: 1,
    bakeryId: 1,
    createdAt: "2025-02-26T15:04:24.287Z",
    latitude: 6.92536,
    longitude: 79.989897,
    productId: 5,
  },
  {
    id: 12,
    price: 160,
    sold: 7,
    name: "Muffin",
    seller: 1,
    bakeryId: 1,
    createdAt: "2025-02-25T15:04:24.287Z",
    latitude: 6.925555,
    longitude: 79.990219,
    productId: 5,
  },
];

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (prisma) => {
    // Create Users
    // const users = await prisma.user.createMany({
    //   data: USERS,
    // });

    await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 6`;

    // const manager = await prisma.manager.create({
    //   data: {
    //     id: 1,
    //     userId: 1,
    //   },
    // });
    await prisma.$executeRaw`ALTER SEQUENCE "Manager_id_seq" RESTART WITH 2`;
    // Create Bakery
    // const bakery = await prisma.bakery.create({
    //   data: {
    //     id: 1,
    //     name: "John's Bakery",
    //     managerId: 1,
    //     latitude: 6.924575,
    //     longitude: 79.987234,
    //   },
    // });
    await prisma.$executeRaw`ALTER SEQUENCE "Bakery_id_seq" RESTART WITH 2`;
    // Create Employees
    // await prisma.employee.createMany({
    //   data: EMPLOYEES,
    // });
    await prisma.$executeRaw`ALTER SEQUENCE "Employee_id_seq" RESTART WITH 15`;
    // Create Products
    // await prisma.product.createMany({
    //   data: PRODUCTS,
    // });
    await prisma.$executeRaw`ALTER SEQUENCE "Product_id_seq" RESTART WITH 15`;
    // Create Orders
    // await prisma.order.createMany({
    //   data: ORDERS,
    // });
    await prisma.$executeRaw`ALTER SEQUENCE "Order_id_seq" RESTART WITH 15`;
  });

  console.log("Data has been inserted successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
