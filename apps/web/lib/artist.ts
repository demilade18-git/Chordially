import { cookies } from "next/headers";

export interface ArtistDraft {
  stageName: string;
  slug: string;
  city: string;
  genres: string;
  bio: string;
  wallet: string;
  // CHORD-112: extended identity fields
  categories: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  website: string;
  // CHORD-113: normalized genre list
  genreList: string[];
}

const cookieName = "chordially_artist";

const defaultArtist: ArtistDraft = {
  stageName: "Nova Chords",
  slug: "nova-chords",
  city: "Lagos",
  genres: "Afrobeats, Indie Soul",
  bio: "Loop pedal sets with real-time audience requests and instant Stellar tips.",
  wallet: "GCFX3GM2V4N2O5NFEZ5XGUV3VZL57BC4Q43SGV5WW6H2I6J53GVL5W7W",
  categories: "",
  instagram: "",
  twitter: "",
  tiktok: "",
  website: "",
  genreList: [],
};

export function getArtist() {
  const raw = cookies().get(cookieName)?.value;

  if (!raw) {
    return defaultArtist;
  }

  try {
    return JSON.parse(raw) as ArtistDraft;
  } catch {
    return defaultArtist;
  }
}

export function setArtist(artist: ArtistDraft) {
  cookies().set(cookieName, JSON.stringify(artist), {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
}

export function getArtistBySlug(slug: string) {
  const artist = getArtist();
  return artist.slug === slug ? artist : null;
}

/** CHORD-112: Merge partial fields into the draft without overwriting unrelated fields. */
export function saveDraft(partial: Partial<ArtistDraft>) {
  const current = getArtist();
  setArtist({ ...current, ...partial });
}

/** CHORD-113: Parse a comma-separated genres string into a normalized, deduplicated list. */
export function normalizeGenres(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((g) => g.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}
