import db from "@/src/db";
import { user } from "@/src/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // capture payment---

  try {
    const User = await db.select().from(user).where(eq(user.id, userId));

    if (!User) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // update subscription status
    const subscriptionEnds = new Date();
    subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);

    const updatedUser = await db
      .update(user)
      .set({
        is_subscribed: true,
        subscription_ends: subscriptionEnds,
      })
      .where(eq(user.id, userId));

    return NextResponse.json({
      message: "Subscription updated successfully",
      updatedUser,
    });
  } catch (error) {
    return NextResponse.json({ error: `Error in ${error}` }, { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // capture payment

  try {
    const User = await db.query.user.findFirst({
        // where: eq(user.id, userId),
        where: {id: userId},
        columns: {
            id: true,
            is_subscribed: true,
            subscription_ends: true,
        },
    });
    if (!User) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    if (User.subscription_ends && User.subscription_ends < now) {
      await db
        .update(user)
        .set({
          is_subscribed: false,
        //   subscription_ends: now,
        })
        .where(eq(user.id, userId));

        return NextResponse.json({
            message: "User is Subscribed",
            isSubscribed: User.is_subscribed,
            subscriptionEnds: User.subscription_ends
        });
    };

    return NextResponse.json({
      message: "Subscription checked successfully",
      isSubscribed: User.is_subscribed,
      subscriptionEnds: User.subscription_ends
    });

  } catch (error) {
    return NextResponse.json({ 
        message: `Error in ${error}` 
    }, { status: 500 });
  };
};
