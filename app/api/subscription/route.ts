import db from "@/src/db";
import { user } from "@/src/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";



export async function POST() {

  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const User = await db.select().from(user).where(eq(user.id, userId));  // select() - returns array
  if (!User[0] || User.length === 0) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // capture payment---
  const paymentSuccess = true;

  try {
    // update subscription status
    const subscriptionEnds = new Date();
    subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);

    const updatedUser = await db.update(user).set({
        is_subscribed    : paymentSuccess,
        subscription_ends: subscriptionEnds,
      }).where(eq(user.id, userId));

    return Response.json({
      message: "Subscription updated successfully",
      updatedUser,
    }, {status: 200});
  } catch (error) {
    return Response.json({ error: `Error in ${error}` }, { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // capture payment

  try {
    const User = await db.query.user.findFirst({
        where: {id: userId},
        columns: {
            id: true,
            is_subscribed: true,
            subscription_ends: true,
        },
    });
    if (!User) {
      return Response.json({ error: "Unauthorized, not subscribed" }, { status: 401 });
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

        return Response.json({
            success: true,
            message: "User is Subscribed",
            isSubscribed: true,
            subscriptionEnds: User.subscription_ends,
        }, {status: 200});
    };

    return Response.json({
      success: false,
      isSubscribed: false,
      message: "Subscription expired",
      subscriptionEnds: User.subscription_ends,
    }, {status: 401});

  } catch (error) {
    return Response.json({ 
        message: `Error in ${error}` 
    }, { status: 500 });
  };
};
