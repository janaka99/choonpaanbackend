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
  const { location, orders } = await req.json();
  try {
    // NEED TO WRITE LOGIC HERE

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
