import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await isLoggedIn(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }
  // get the order informations from the user
  const { location, orders, user: loggedUser } = await req.json();
  try {
    // Format the order in the required structure to save it in the database
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

    // save the order in the database
    const addedProducts = await prisma.order.createMany({
      data: newOrders,
    });

    // update the stocks after order placed
    const updateStockPromises = orders.map((order: any) =>
      prisma.product.update({
        where: { id: Number(order.productId) },
        data: { stock: { decrement: Number(order.baught) } },
      })
    );
    await Promise.all(updateStockPromises);

    // after update the stock find the low stock products ( stocks below 5)
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

    // if there are low stock products, create a notification for the user
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
