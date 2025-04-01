import { prisma } from "@/lib/prisma";
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
  // get the name, price and stock from the user
  const { name, price, stock } = await req.json();
  try {
    // validate the name , price and stock
    const { success, data, error } = ProductSchema.safeParse({
      name,
      price,
      stock,
    });

    if (!success) {
      return NextResponse.json(
        { error: true, message: "Failed to add product" },
        { status: 200 }
      );
    }

    //  find the products with same name
    const product = await prisma.product.findFirst({
      where: {
        userId: user.id,
        name: data.name,
      },
    });
    // if products with same name exists. informa the user and Product already exists in the database
    if (product) {
      return NextResponse.json(
        { error: true, message: "Product already exists" },
        { status: 200 }
      );
    }
    // IF no products with that name found, Create new product with that name
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        stock: data.stock,
        userId: user.id,
      },
    });
    // if product is created successfully, inform the user
    return NextResponse.json(
      {
        error: false,
        message: "Product created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
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
