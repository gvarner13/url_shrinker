import { Status } from "https://deno.land/std/http/http_status.ts";

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
      break;
    }

    default: {
      return new Response(undefined, { status: 401 });
    }
  }
}
