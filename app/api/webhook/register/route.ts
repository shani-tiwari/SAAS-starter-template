import { Webhook } from "svix";
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server";
import db from '@/src/index';
import { user } from "@/src/db/schema";


export async function POST(req: Request) {

    
    const webhook_secret = process.env.WEBHOOK_SECRET;
    if(!webhook_secret){
        throw new Error("please add webhook secret in env");
    };
    
    const header  = await headers();
    const svix_id        = header.get("svix-id") ?? "";
    const svix_timestamp = header.get("svix-timestamp") ?? "";
    const svix_signature = header.get("svix-signature") ?? "";
  
    if(!svix_id || !svix_timestamp || !svix_signature){
        throw new Response("svix headers not found", {
            status: 400,
        });
    };


    // payload - data , comes from clerk
    const payload = await req.json(); 
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhook_secret);

    let evt: WebhookEvent;
    try {
        evt = wh.verify(body, { svix_id, svix_timestamp, svix_signature }) as WebhookEvent;
    } catch (error) {
        console.log('Error in verifying webhook', error);
        return new Response('error in webhook', {status: 400});
    };
    
    // const { id } = evt.data;
    const eventType = evt.type;

    if(eventType === 'user.created'){

       try{
        
            const { email_addresses, primary_email_address_id } = evt.data; 

            const primaryEmail = email_addresses.find(email => email.id === primary_email_address_id);

            if(!primaryEmail) {
                throw new Response('primary email not found', {status: 404})
            };

            // create user in db(drizzle)
            const newUser = await db.insert(user).values({
                id: evt.data.id!,  // used `text` in schema
                name: "...",
                email: primaryEmail.email_address!,
                is_subscribed: false,
                subscription_ends: new Date(),
            });

            console.log("user created", newUser);
            return new Response(JSON.stringify({newUser}), {status: 200}); 
            
       }catch(err){
            console.log('Error in creating user', err);
            return new Response('error in creating user', {status: 400});
       }
    };


    return new Response('success', {status: 200})



};