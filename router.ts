import { Status } from "https://deno.land/std/http/http_status.ts";
import { saveLink, getLink } from "./db.ts";

const template = await Deno.readTextFile("./landing_template.html");

export async function handleRequest(req: Request, resp: any) {
  const u = new URL(req.url);
  const path = u.pathname,
    target = u.searchParams.get("target");
  switch (req.method) {
    case "GET": {
      //here we would fire a redirect if the path is found in the db
      // console.log({req, target});
      if (path === "/1234") {
        return new Response(undefined, {
          status: Status.Found,
          headers: new Headers({ location: "https://github.com/gvarner13" }),
        });
      }
      if (path === "/") {
        return new Response(template, {
          status: 200,
          headers: {
            "content-type": "text/html; charset=utf-8",
          },
        });
      }
      return getLink(req);
      break;
    }

    case "POST": {
      //check if the path is correct and then save to the db
      if (path !== "/shrink") return new Response(undefined, { status: 404 });
      // addTarget(resp, target);
      //   console.log({ req });
      //   if (req.body) {
      //     const body = await req.json();
      //     console.log(body);
      //   }
      return saveLink(req);
      // return new Response(JSON.stringify({shortUrl: "https://gvarner.info/1234"}),
      //     {status: Status.OK,
      //         headers: {"content-type": 'application/json'}
      //     })
      break;
    }

    default: {
      return new Response(undefined, { status: 401 });
    }
  }
}
