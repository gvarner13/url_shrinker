import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "https://deno.land/x/aws_sdk@v3.32.0-1/client-dynamodb/mod.ts";
import "https://deno.land/std@0.170.0/dotenv/load.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";
import { newUrl } from "./utils.ts";

function getId() {
  const arr = new Uint8Array(8 / 2);
  crypto.getRandomValues(arr);
  const toHex = (d: any) => d.toString(36).padStart(2, "0").toUpperCase();
  return Array.from(arr, toHex).join("");
}

// Create a client instance by providing your region information.
// The credentials are obtained from environment variables which
// we set during our project creation step on Deno Deploy.
const client = new DynamoDBClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID"),
    secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY"),
  },
});

export async function saveLink(request) {
  let url;
  try {
    if (request.body) {
      const body = await request.json();
      url = newUrl(body.url);
      console.log(url);
    }
    // When we want to interact with DynamoDB, we send a command using the client
    // instance. Here we are sending a PutItemCommand to insert the data from the
    // request.
    const id = getId();
    const {
      $metadata: { httpStatusCode },
    } = await client.send(
      new PutItemCommand({
        TableName: "Links",
        Item: {
          id: { S: id },
          target: { S: url },
          shortLink: { S: id },
        },
      })
    );

    // On a successful put item request, dynamo returns a 200 status code (weird).
    // So we test status code to verify if the data has been inserted and respond
    // with the data provided by the request as a confirmation.
    if (httpStatusCode === 200) {
      return new Response(undefined, { status: 200 });
    }
  } catch (error) {
    // If something goes wrong while making the request, we log
    // the error for our reference.
    console.log(error);
  }

  // If the execution reaches here it implies that the insertion wasn't successful.
  // return json({ error: "couldn't insert data" }, { status: 500 });
  return new Response(undefined, { status: 500 });
}

export async function getLink(request) {
  try {
    // We grab the title form the request and send a GetItemCommand
    // to retrieve the information about the song.
    const { pathname } = new URL(request.url);
    const id = pathname.substring(1);
    console.log(id);
    const { Item } = await client.send(
      new GetItemCommand({
        TableName: "Links",
        Key: {
          id: { S: id },
        },
      })
    );

    // The Item property contains all the data, so if it's not undefined,
    // we proceed to returning the information about the title
    if (Item) {
      console.log({ Item });
      return new Response(undefined, {
        status: Status.Found,
        headers: new Headers({ location: `https://${Item.target.S}` }),
      });
    }
  } catch (error) {
    console.log(error);
  }

  // We might reach here if an error is thrown during the request to database
  // or if the Item is not found in the database.
  // We reflect both conditions with a general message.
  return new Response(undefined, { status: 404 });
}
