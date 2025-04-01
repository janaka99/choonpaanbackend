import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { JourneySchema } from "@/schemas/journey";

export async function POST(req: NextRequest) {
  const user = await isLoggedIn(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const { journey } = await req.json();

    //  get the journey information from the user
    if (!journey) {
      return NextResponse.json(
        { error: true, message: "Something Went Wrong. Try again later" },
        { status: 500 }
      );
    }
    const myJourney = JSON.parse(journey);
    const { success, data, error } = JourneySchema.safeParse({
      route: myJourney.route,
      orderInsights: myJourney.orderInsights,
    });

    if (!success) {
      console.log(error);
      return NextResponse.json(
        { error: true, message: "Something Went Wrong. Try again later" },
        { status: 200 }
      );
    }
    // Check if the user already has an ongoing journey
    const startedJourneys = await prisma.journey.findMany({
      where: {
        userid: user.id,
        endAt: null,
      },
    });

    // If there are ongoing journeys, return an error response
    if (startedJourneys.length > 0) {
      return NextResponse.json(
        {
          error: true,
          message: "You must end current jounrey to start a new one",
        },
        { status: 200 }
      );
    }

    // Create a new journey for the user
    const createdJourney = await prisma.journey.create({
      data: {
        route: data.route,
        orderInsights: data.orderInsights ? data.orderInsights : {},
        userid: user.id,
      },
    });

    return NextResponse.json(
      {
        error: false,
        message: "Journey has been started",
        journey: JSON.stringify(createdJourney),
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
