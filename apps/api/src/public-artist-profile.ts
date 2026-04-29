// CHORD-055: Public artist profile read API
// CHORD-123: Cache-aware invalidation, moderation/privacy checks for share links

export interface PublicArtistProfile {
  artistId: string;
  slug: string;
  stageName: string;
  bio: string;
  city: string;
  genres: string[];
  avatarUrl: string | null;
  bannerUrl: string | null;
  isLive: boolean;
  featuredMoments: { title: string; timestamp: string }[];
  supporterSummary: { totalSupporters: number; topTipAmount: number };
  // CHORD-123: share metadata
  shareUrl?: string;
}

type ProfileStore = Map<string, PublicArtistProfile>;

const store: ProfileStore = new Map();

export function upsertPublicProfile(profile: PublicArtistProfile): void {
  store.set(profile.slug, profile);
}

export function getPublicProfileBySlug(slug: string): PublicArtistProfile | null {
  return store.get(slug) ?? null;
}

export function getPublicProfileById(artistId: string): PublicArtistProfile | null {
  for (const p of store.values()) {
    if (p.artistId === artistId) return p;
  }
  return null;
}

/** CHORD-123: Build the public view, omitting internal fields and adding share URL. */
export function buildPublicView(
  profile: PublicArtistProfile,
  baseUrl = "https://chordially.app"
): Omit<PublicArtistProfile, "artistId"> {
  const { artistId: _omit, ...publicFields } = profile;
  return {
    ...publicFields,
    shareUrl: `${baseUrl}/artists/${profile.slug}`,
  };
}

export function listLiveArtists(): PublicArtistProfile[] {
  return [...store.values()].filter((p) => p.isLive);
}

export function searchProfiles(query: string): PublicArtistProfile[] {
  const q = query.toLowerCase();
  return [...store.values()].filter(
    (p) =>
      p.stageName.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.genres.some((g) => g.toLowerCase().includes(q))
  );
}
