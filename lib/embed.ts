/**
 * Resolves a pasted link (YouTube, Loom, Zoom, Slack) into a playable
 * source for the PiP reference window. Playback only — no download of
 * third-party video is offered, since that would require a server-side
 * fetch pipeline and generally violates the platforms' terms of service.
 */

export type EmbedPlatform = "youtube" | "loom" | "zoom" | "slack" | "unknown";

/**
 * "iframe"      — render in an <iframe> (YouTube/Loom/Zoom).
 * "video"       — render in a native <video> tag. Slack's public file links
 *                 resolve straight to the media rather than an app page, and
 *                 Slack's own UI blocks framing, so a <video> tag works
 *                 where an <iframe> wouldn't.
 * "unsupported" — link is recognized as belonging to a platform, but this
 *                 specific link can't be embedded (e.g. a Slack channel
 *                 message link, which requires being signed into Slack).
 */
export type EmbedKind = "iframe" | "video" | "unsupported";

export interface EmbedResult {
  platform: EmbedPlatform;
  kind: EmbedKind;
  embedUrl: string | null;
}

export function resolveEmbed(rawUrl: string): EmbedResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) return { platform: "unknown", kind: "unsupported", embedUrl: null };

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { platform: "unknown", kind: "unsupported", embedUrl: null };
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    let id = "";
    if (host === "youtu.be") {
      id = url.pathname.slice(1);
    } else if (url.pathname.startsWith("/shorts/")) {
      id = url.pathname.split("/")[2] ?? "";
    } else if (url.pathname.startsWith("/embed/")) {
      id = url.pathname.split("/")[2] ?? "";
    } else {
      id = url.searchParams.get("v") ?? "";
    }
    if (!id) return { platform: "youtube", kind: "unsupported", embedUrl: null };
    return { platform: "youtube", kind: "iframe", embedUrl: `https://www.youtube.com/embed/${id}` };
  }

  if (host === "loom.com") {
    const segments = url.pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];
    if (!id) return { platform: "loom", kind: "unsupported", embedUrl: null };
    return { platform: "loom", kind: "iframe", embedUrl: `https://www.loom.com/embed/${id}` };
  }

  if (host.endsWith("zoom.us")) {
    // Zoom share links are generally embeddable as-is.
    return { platform: "zoom", kind: "iframe", embedUrl: trimmed };
  }

  // Slack's public file-share links (from "More actions > Create external
  // link" on a video clip/file) resolve directly to the media, so they play
  // in a plain <video> tag.
  if (host === "slack-files.com" || host === "files.slack.com") {
    return { platform: "slack", kind: "video", embedUrl: trimmed };
  }

  // A workspace's own Slack domain (e.g. yourteam.slack.com or
  // app.slack.com) pointing at a channel message rather than a raw file.
  // Slack requires an active signed-in session and blocks framing its own
  // pages, so this can never be embedded directly — the UI surfaces
  // guidance instead of a blank/broken player.
  if (host.endsWith(".slack.com")) {
    return { platform: "slack", kind: "unsupported", embedUrl: null };
  }

  return { platform: "unknown", kind: "unsupported", embedUrl: null };
}
