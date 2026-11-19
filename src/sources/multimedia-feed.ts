import type { MultimediaBlock } from "../types/layout";

const YOUTUBE_CHANNEL_ID =
  import.meta.env.VITE_PO_YOUTUBE_CHANNEL_ID || "UC0qUQ1gy_1APN2yvXpujXsQ";

const INSTAGRAM_FEED_URL =
  import.meta.env.VITE_PO_INSTAGRAM_FEED_URL || "";

const EDITORIAL_COLORS = ["#3d4451", "#9C0015", "#2c3e50", "#5d4e42"];

export async function fetchLatestYoutubeVideos(limit = 10): Promise<MultimediaBlock[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

  // 1. Intento principal: rss2json (devuelve exactamente los últimos 10 videos en JSON limpio)
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.status === "ok" && Array.isArray(data.items) && data.items.length > 0) {
        return data.items.slice(0, limit).map(
          (item: { link?: string; title?: string; guid?: string }, idx: number) => {
            const link = item.link || "";
            const videoIdMatch = link.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
            const videoId =
              videoIdMatch?.[1] || item.guid?.replace("yt:video:", "") || "";

            return {
              type: "multimedia",
              platform: "youtube",
              url: link || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : ""),
              videoId,
              title: item.title || "Video Prensa Obrera",
              category: "YOUTUBE",
              thumbnailUrl: videoId
                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                : "",
              accentColor: EDITORIAL_COLORS[idx % EDITORIAL_COLORS.length],
            };
          },
        );
      }
    }
  } catch {
    // Continúa al respaldo XML
  }

  // 2. Respaldo: XML directo vía allorigins / get
  const backupUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
  const backupRes = await fetch(backupUrl);
  if (!backupRes.ok) {
    throw new Error("No se pudieron obtener los videos de YouTube");
  }

  const backupJson = await backupRes.json();
  const xmlText: string = backupJson?.contents || "";
  if (!xmlText.includes("<entry>")) {
    throw new Error("El feed de YouTube no devolvió videos válidos");
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");
  const entries = Array.from(xmlDoc.querySelectorAll("entry")).slice(0, limit);

  return entries.map((entry, idx) => {
    const rawId = entry.querySelector("id")?.textContent?.trim() || "";
    const videoId = rawId.replace("yt:video:", "");
    const title =
      entry.querySelector("title")?.textContent?.trim() || "Video Prensa Obrera";
    const link =
      entry.querySelector("link")?.getAttribute("href") ||
      (videoId ? `https://www.youtube.com/watch?v=${videoId}` : "");

    return {
      type: "multimedia",
      platform: "youtube",
      url: link,
      videoId,
      title,
      category: "YOUTUBE",
      thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "",
      accentColor: EDITORIAL_COLORS[idx % EDITORIAL_COLORS.length],
    };
  });
}

export async function fetchLatestInstagramReels(limit = 5): Promise<MultimediaBlock[]> {
  if (!INSTAGRAM_FEED_URL) return [];

  const res = await fetch(INSTAGRAM_FEED_URL);
  if (!res.ok) throw new Error("No se pudieron obtener los Reels de Instagram");

  const payload = await res.json();
  const rawList = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.posts)
      ? payload.posts
      : Array.isArray(payload)
        ? payload
        : [];

  const reels = rawList
    .filter(
      (m: Record<string, string>) =>
        !m.media_product_type ||
        m.media_product_type === "REELS" ||
        m.media_type === "VIDEO" ||
        m.mediaType === "VIDEO",
    )
    .slice(0, limit);

  return reels.map((m: Record<string, string>) => {
    const rawCaption = m.caption || m.title || "Reel de Prensa Obrera";
    const cleanTitle = rawCaption.split("\n")[0].slice(0, 95);

    return {
      type: "multimedia",
      platform: "instagram",
      url: m.permalink || m.link || "https://www.instagram.com/prensaobrera/reels/",
      title: cleanTitle,
      category: "REEL",
      thumbnailUrl:
        m.thumbnail_url || m.thumbnailUrl || m.media_url || m.mediaUrl || m.image || "",
    };
  });
}