import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { isLoggedIn } from "@/utils/auth";
import { ProductSchema } from "@/schemas/product";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextApiResponse) {
  const user = await isLoggedIn(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }
  const { location, orders, user: loggedUser } = await req.json();
  try {
    const newOrders = orders.map((order: any) => ({
      name: order.name,
      price: Number(order.price),
      bakeryId: loggedUser.bakery_id,
      seller: user.id,
      sold: order.baught,
      productId: Number(order.productId),
      latitude: location.latitude,
      longitude: location.longitude,
    }));

    console.log(newOrders);

    const addedProducts = await prisma.order.createMany({
      data: newOrders,
    });

    const updateStockPromises = orders.map((order: any) =>
      prisma.product.update({
        where: { id: Number(order.productId) },
        data: { stock: { decrement: Number(order.baught) } },
      })
    );
    await Promise.all(updateStockPromises);

    const lowStockProducts = await prisma.product.findMany({
      where: {
        userId: user.id,
        stock: {
          lt: 5,
        },
      },
      select: {
        name: true,
      },
    });

    if (lowStockProducts.length > 0) {
      const productNames = lowStockProducts
        .map((product) => product.name)
        .join(", ");
      await prisma.notification.create({
        data: {
          title: "Low Stock",
          description: `The following products have low stock: ${productNames}`,
          userid: user.id,
        },
      });
    }

    return NextResponse.json(
      {
        error: false,
        message: "Stock has been updated",
        // product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}
