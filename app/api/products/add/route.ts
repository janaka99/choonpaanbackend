import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { z } from "zod";
import { isLoggedIn } from "@/utils/auth";
import { ProductSchema } from "@/schemas/product";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await isLoggedIn(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { name, price, stock } = await req.json();
  try {
    const { success, data, error } = ProductSchema.safeParse({
      name,
      price,
      stock,
    });

    if (!success) {
      console.log(error);
      return NextResponse.json(
        { error: true, message: "Failed to add product" },
        { status: 200 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        name: data.name,
      },
    });

    if (product) {
      return NextResponse.json(
        { error: true, message: "Product already exists" },
        { status: 200 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        stock: data.stock,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        error: false,
        message: "Product created successfully",
        // product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: true,
          message: "Invalid data",
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}
