import { prisma } from "@/lib/prisma";
import { ProductSchema } from "@/schemas/product";
import { isLoggedIn } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pid } = await params;

    if (!pid) {
      return NextResponse.json(
        { error: true, message: "Something went wrong!" },
        { status: 401 }
      );
    }
    const productId = Number(pid);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: true, message: "Invalid Request" },
        { status: 400 }
      );
    }
    const user = await isLoggedIn(req);
    if (!user) {
      return NextResponse.json(
        { error: true, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, price, stock, id } = await req.json();

    const { success, data, error } = ProductSchema.safeParse({
      name,
      price,
      stock,
    });

    if (!success) {
      return NextResponse.json(
        { error: true, message: "Failed to update the product" },
        { status: 200 }
      );
    }

    if (productId != id) {
      return NextResponse.json(
        { error: true, message: "Invalid Request" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        userId: user.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: true, message: "Invalid Request" },
        { status: 200 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        name: data.name,
        price: data.price,
        stock: data.stock,
      },
    });

    return NextResponse.json(
      {
        error: false,
        message: "Product has been successfully updated",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: true, message: "Something went wrong!" },
      { status: 401 }
    );
  }
}
