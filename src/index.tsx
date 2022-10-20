// @ts-ignore
import satori, { init } from "satori/wasm";
// @ts-ignore
import initYoga from "yoga-wasm-web";
import yogaWasm from "./vender/yoga.wasm";
import resvgWasm from "./vender/resvg.wasm";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { loadGoogleFont } from "./utils/loadFont";
import React from "react";
import { Image } from "./components/Image";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

const genModuleInit = () => {
  let isInit = false;
  return async () => {
    if (isInit) {
      return;
    }

    init(await initYoga(yogaWasm));
    await initWasm(resvgWasm);
    isInit = true;
  };
};

const initModule = genModuleInit();

async function handleRequest(request: Request) {
  await initModule();
  const { searchParams } = new URL(request.url);
  const textParam = searchParams.get("text");
  const notoSans = await loadGoogleFont({
    family: "Noto Sans JP",
    weight: 100,
  });

  const svg = await satori(<Image text={textParam || ""} />, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "NotoSansJP",
        data: notoSans,
        weight: 100,
        style: "thin",
      },
    ],
  });

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer, {
    headers: {
      "content-type": "image/png",
    },
  });
}

addEventListener("fetch", (event) => {
  if (event.request.method === "GET") {
    return event.respondWith(handleRequest(event.request));
  }
  return event.respondWith(new Response(`The request wasn't a GET`));
});
