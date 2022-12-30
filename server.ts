import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {handleRequest} from "./router.ts";

const port = 8080;

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`);
await serve(handleRequest, { port });