console.log("Loading function");

import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event, context) => {
  console.log(event);
  try {
    // We grab the title form the request and send a GetItemCommand
    // to retrieve the information about the song.
    const { id } = event.pathParameters;
    console.log(id);
    const { Item } = await ddbDocClient.send(
      new GetCommand({
        TableName: "Links",
        Key: {
          id: id,
        },
      })
    );

    // The Item property contains all the data, so if it's not undefined,
    // we proceed to returning the information about the title
    if (Item) {
      console.log({ Item });
      //need to update the count
      // Set the primary key of the item you want to update
      const key = { id: id };

      // Use an UpdateExpression to increment the 'count' attribute by 1
      const expression = "SET #ct = #ct + :inc";
      const values = {
        ":inc": 1,
      };

      // Update the item
      const params = {
        TableName: "Links",
        Key: key,
        UpdateExpression: expression,
        ExpressionAttributeValues: values,
        ExpressionAttributeNames: {
          "#ct": "count",
        },
        ReturnValues: "ALL_NEW",
      };

      const data = await ddbDocClient.send(new UpdateCommand(params));
      console.log(data);
      return {
        statusCode: 301,
        headers: {
          location: `https://${Item.target}`,
        },
      };
    }
  } catch (error) {
    console.log(error);
  }
  // We might reach here if an error is thrown during the request to database
  // or if the Item is not found in the database.
  // We reflect both conditions with a general message.

  return { statusCode: 404 };
};
