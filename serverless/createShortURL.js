import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import crypto from "crypto";

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

function getId() {
  const arr = new Uint8Array(8 / 2);
  crypto.getRandomValues(arr);
  const toHex = (d) => d.toString(36).padStart(2, "0").toUpperCase();
  return Array.from(arr, toHex).join("");
}

export const handler = async (event, context) => {
  const url = event.url;
  const id = getId();

  const result = await ddbDocClient.send(
    new PutCommand({
      TableName: "Links",
      Item: {
        id: id,
        target: url,
        shortLink: id,
        count: 0,
      },
    })
  );
  const response = {
    statusCode: 200,
    body: JSON.stringify("Link created"),
  };
  return response;
};
