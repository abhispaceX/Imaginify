import { clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import { connectToDatabase } from "@/lib/Database/mongoose"; // Import the database connection

export async function POST(req: Request) {
 

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("WEBHOOK_SECRET is not set");
    return new Response("WEBHOOK_SECRET is not set", { status: 500 });
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Error occurred -- no svix headers");
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  let payload: any;
  try {
    payload = await req.json();
  } catch (err) {
    console.error("Error parsing request body:", err);
    return new Response("Error parsing request body", { status: 400 });
  }
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("Webhook verified successfully");
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", {
      status: 400,
    });
  }

  // Connect to the database
  try {
    await connectToDatabase();
    console.log("Connected to database");
  } catch (error) {
    console.error("Error connecting to database:", error);
    return new Response("Error connecting to database", { status: 500 });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Webhook with ID of ${id} and type of ${eventType}`);

  // CREATE
  if (eventType === "user.created") {
    try {
      const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

      const user = {
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username!,
        firstName: first_name,
        lastName: last_name,
        photo: image_url,
      };

      console.log("Creating user:", user);
      const newUser = await createUser(user);
      console.log("User created:", newUser);

      if (newUser) {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
            userId: newUser._id,
          },
        });
      }

      return NextResponse.json({ message: "OK", user: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error creating user", { status: 500 });
    }
  }

  // UPDATE
  if (eventType === "user.updated") {
    try {
      const { id, image_url, first_name, last_name, username } = evt.data;

      const user = {
        firstName: first_name ?? '',
        lastName: last_name ?? '',
        username: username!,
        photo: image_url,
      };

      console.log("Updating user:", id, user);
      const updatedUser = await updateUser(id, user);
      console.log("User updated:", updatedUser);

      return NextResponse.json({ message: "OK", user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      return new Response("Error updating user", { status: 500 });
    }
  }

  // DELETE
  if (eventType === "user.deleted") {
    try {
      const { id } = evt.data;

      console.log("Deleting user:", id);
      const deletedUser = await deleteUser(id!);
      console.log("User deleted:", deletedUser);

      return NextResponse.json({ message: "OK", user: deletedUser });
    } catch (error) {
      console.error("Error deleting user:", error);
      return new Response("Error deleting user", { status: 500 });
    }
  }

  console.log("Webhook processed successfully");
  return new Response("Webhook processed", { status: 200 });
}