import type { FastifyInstance } from "fastify";

type OnboardingStep = "identity" | "genre" | "location" | "payout";
type DraftStatus = "incomplete" | "ready";

// CHORD-112: Extended identity fields
interface ArtistDraft {
  artistId: string;
  stageName: string | null;
  categories: string[];
  location: string | null;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  website: string | null;
  // CHORD-113: normalized genre taxonomy
  genre: string | null;
  genreList: string[];
  payoutReady: boolean;
  completedSteps: OnboardingStep[];
  status: DraftStatus;
  updatedAt: string;
}

const drafts = new Map<string, ArtistDraft>();

function computeStatus(draft: ArtistDraft): DraftStatus {
  const required: OnboardingStep[] = ["identity", "genre", "location", "payout"];
  return required.every((s) => draft.completedSteps.includes(s))
    ? "ready"
    : "incomplete";
}

/** CHORD-113: Normalize a raw genre string into a deduplicated lowercase list. */
function normalizeGenres(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((g) => g.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

export async function artistOnboardingRoutes(app: FastifyInstance) {
  // CHORD-112: Autosave draft – PUT merges partial identity fields
  app.put<{ Params: { artistId: string }; Body: Partial<ArtistDraft> }>(
    "/onboarding/artist/:artistId/draft",
    async (request, reply) => {
      const { artistId } = request.params;
      const existing = drafts.get(artistId) ?? {
        artistId,
        stageName: null,
        categories: [],
        location: null,
        instagram: null,
        twitter: null,
        tiktok: null,
        website: null,
        genre: null,
        genreList: [],
        payoutReady: false,
        completedSteps: [] as OnboardingStep[],
        status: "incomplete" as DraftStatus,
        updatedAt: new Date().toISOString(),
      };

      const body = request.body;

      // CHORD-113: if genre string provided, normalize into genreList
      const genreList =
        typeof body.genre === "string"
          ? normalizeGenres(body.genre)
          : body.genreList ?? existing.genreList;

      const merged: ArtistDraft = {
        ...existing,
        ...body,
        genreList,
        artistId,
        updatedAt: new Date().toISOString(),
      };

      if (merged.stageName && !merged.completedSteps.includes("identity")) {
        merged.completedSteps.push("identity");
      }
      if (merged.genreList.length > 0 && !merged.completedSteps.includes("genre")) {
        merged.completedSteps.push("genre");
      }
      if (merged.location && !merged.completedSteps.includes("location")) {
        merged.completedSteps.push("location");
      }
      if (merged.payoutReady && !merged.completedSteps.includes("payout")) {
        merged.completedSteps.push("payout");
      }

      merged.status = computeStatus(merged);
      drafts.set(artistId, merged);

      app.log.info({ artistId, step: "draft_saved", status: merged.status }, "[onboarding] draft saved");
      return reply.send(merged);
    }
  );

  app.get<{ Params: { artistId: string } }>(
    "/onboarding/artist/:artistId/draft",
    async (request, reply) => {
      const draft = drafts.get(request.params.artistId);
      if (!draft) return reply.status(404).send({ error: "draft_not_found" });
      return reply.send(draft);
    }
  );

  // CHORD-113: Dedicated genre taxonomy endpoint
  app.put<{ Params: { artistId: string }; Body: { genres: string | string[] } }>(
    "/onboarding/artist/:artistId/genres",
    async (request, reply) => {
      const { artistId } = request.params;
      const raw = request.body.genres;
      const genreList = Array.isArray(raw)
        ? Array.from(new Set(raw.map((g) => g.trim().toLowerCase()).filter(Boolean)))
        : normalizeGenres(raw);

      if (genreList.length === 0) {
        return reply.status(400).send({ error: "at_least_one_genre_required" });
      }

      const existing = drafts.get(artistId) ?? {
        artistId,
        stageName: null,
        categories: [],
        location: null,
        instagram: null,
        twitter: null,
        tiktok: null,
        website: null,
        genre: genreList.join(", "),
        genreList,
        payoutReady: false,
        completedSteps: [] as OnboardingStep[],
        status: "incomplete" as DraftStatus,
        updatedAt: new Date().toISOString(),
      };

      const updated: ArtistDraft = {
        ...existing,
        genre: genreList.join(", "),
        genreList,
        updatedAt: new Date().toISOString(),
      };

      if (!updated.completedSteps.includes("genre")) {
        updated.completedSteps.push("genre");
      }
      updated.status = computeStatus(updated);
      drafts.set(artistId, updated);

      app.log.info({ artistId, genreList }, "[onboarding] genres updated");
      return reply.send({ artistId, genreList, status: updated.status });
    }
  );

  app.get<{ Params: { artistId: string } }>(
    "/onboarding/artist/:artistId/genres",
    async (request, reply) => {
      const draft = drafts.get(request.params.artistId);
      if (!draft) return reply.status(404).send({ error: "draft_not_found" });
      return reply.send({ artistId: request.params.artistId, genreList: draft.genreList });
    }
  );
}
