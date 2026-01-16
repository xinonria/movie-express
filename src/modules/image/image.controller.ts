import { Request, Response } from "express";

const REQUEST_TIMEOUT_MS = 5000;

export async function getImageProxy(req: Request, res: Response) {
    const url = typeof req.query.url === "string" ? req.query.url : "";
    if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
        return res.status(400).end();
    }

    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
    } catch {
        return res.status(400).end();
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(parsedUrl.toString(), {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Referer: "https://movie.douban.com/",
                Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
            },
            signal: controller.signal,
        });

        if (!response.ok) {
            return res.status(response.status).end();
        }

        const contentType = response.headers.get("content-type");
        const safeContentType =
            contentType && contentType.startsWith("image/") ? contentType : "image/jpeg";
        const buffer = Buffer.from(await response.arrayBuffer());

        res.set("Content-Type", safeContentType);
        res.set("Cache-Control", "public, max-age=86400");
        return res.status(200).send(buffer);
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            return res.status(504).end();
        }
        return res.status(502).end();
    } finally {
        clearTimeout(timeout);
    }
}
