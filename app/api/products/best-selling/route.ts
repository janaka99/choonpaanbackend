import { prisma } from "@/lib/prisma";
import { isMangerLoggedInWithBakery } from "@/utils/auth";
import { NextResponse } from "next/server";

const isValidDate = (dateStr: string) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/; // Simple YYYY-MM-DD format check
  return regex.test(dateStr) && !isNaN(new Date(dateStr).getTime());
};
function formatDate(inputDate: any) {
  const date = new Date(inputDate);
  const options = { year: "numeric", month: "short", day: "2-digit" };
  /// @ts-ignore
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
  return formattedDate.replace(",", "").slice(0, 7); // Remove the comma and keep the month and day
}

const getThirtyDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split("T")[0]; // Returns'YYYY-MM-DD'
};

const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1); // Yesterday
  return date.toISOString().split("T")[0]; // Returns 'YYYY-MM-DD'
};

export async function GET(req: any) {
  console.log("Reached fuckers ");
  const user = await isMangerLoggedInWithBakery(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }

  // Extract the startDate and endDate from query parameters
  // @ts-ignore
  const params = await req.nextUrl.searchParams;

  let startDate: string | null = params.get("startDate");
  let endDate: string | null = params.get("endDate");
  let error = false;

  if (!startDate || !isValidDate(startDate)) {
    error = true;
  }

  if (!endDate || !isValidDate(endDate)) {
    error = true;
  }

  if (error) {
    startDate = getThirtyDaysAgo();
    endDate = getYesterday();
  }
  let startDateObj = new Date(startDate!);
  let endDateObj = new Date(endDate!);
  startDateObj.setHours(0, 0, 0, 0);
  endDateObj.setHours(23, 59, 59, 999);
  try {
    const orders = await prisma.order.findMany({
      where: {
        bakeryId: user.bakery.id,
        createdAt: {
          gte: startDateObj!,
          lte: endDateObj!,
        },
      },
      include: {
        Product: true,
      },
    });

    const salesByProduct = orders.reduce((acc: any, order) => {
      const { productId, sold, price, Product } = order;

      // If the product already exists in the accumulator, add the sales to the total
      if (!acc[productId]) {
        acc[productId] = {
          productId,
          name: Product.name, // Get the product name from the Product relation
          sales: 0,
          totalSoldUnits: 0,
        };
      }

      // Add the sales for the current order (sold * price)
      acc[productId].sales += sold * parseFloat(price.toString());
      acc[productId].totalSoldUnits += sold;
      return acc;
    }, {});

    const result = Object.values(salesByProduct);

    return NextResponse.json(
      {
        error: false,
        message: "Products fetched successfully",
        products: result,
        range: `${formatDate(startDate)} - ${formatDate(endDate)}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}
