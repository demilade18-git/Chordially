// CHORD-055: Public artist profile read API
// CHORD-123: Cache-aware invalidation and moderation/privacy checks for share links

import type { Request, Response, Router } from "express";
import { resolveSlug } from "./slug.js";
import { isProfileVisible } from "./moderation.js";
import { buildPublicView } from "../../public-artist-profile.js";

export interface PublicArtistProfile {
  artistId: string;
  slug: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  isLive: boolean;
  featuredMoments: string[];
  supporterCount: number;
  completionScore: number;
}

// In-memory store — replace with DB query in production
const profiles = new Map<string, PublicArtistProfile>();

export function upsertProfile(profile: PublicArtistProfile): void {
  profiles.set(profile.artistId, profile);
}

export function getPublicProfile(artistId: string): PublicArtistProfile | null {
  return profiles.get(artistId) ?? null;
}

/** CHORD-123: Set cache headers – short TTL for live profiles, longer for static. */
function setCacheHeaders(res: Response, isLive: boolean): void {
  const maxAge = isLive ? 10 : 60;
  res.set("Cache-Control", `public, max-age=${maxAge}, stale-while-revalidate=30`);
}

function handleGetBySlug(req: Request, res: Response): void {
  const artistId = resolveSlug(req.params.slug);
  if (!artistId) { res.status(404).json({ error: "Artist not found" }); return; }

  // CHORD-123: Respect moderation – hidden/restricted profiles must not leak
  if (!isProfileVisible(artistId)) {
    res.status(404).json({ error: "Artist not found" });
    return;
  }

  const profile = getPublicProfile(artistId);
  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

  setCacheHeaders(res, profile.isLive);
  res.json({ data: profile });
}

function handleGetById(req: Request, res: Response): void {
  const { artistId } = req.params;

  // CHORD-123: Respect moderation
  if (!isProfileVisible(artistId)) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const profile = getPublicProfile(artistId);
  if (!profile) { res.status(404).json({ error: "Profile not found" }); return; }

  setCacheHeaders(res, profile.isLive);
  res.json({ data: profile });
}

export function registerArtistProfileRoutes(router: Router): void {
  router.get("/artists/:artistId/profile", handleGetById);
  router.get("/artists/by-slug/:slug", handleGetBySlug);
}
