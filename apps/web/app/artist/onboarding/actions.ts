"use server";

import { redirect } from "next/navigation";
import { setArtist, saveDraft, normalizeGenres } from "../../../lib/artist";
import { getOnboardingState, advanceOnboarding, setOnboardingState, STEP_PATHS } from "../../../lib/onboarding-state";

function extractIdentityFields(formData: FormData) {
  const genres = String(formData.get("genres") ?? "").trim();
  return {
    stageName: String(formData.get("stageName") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    genres,
    bio: String(formData.get("bio") ?? "").trim(),
    categories: String(formData.get("categories") ?? "").trim(),
    instagram: String(formData.get("instagram") ?? "").trim(),
    twitter: String(formData.get("twitter") ?? "").trim(),
    tiktok: String(formData.get("tiktok") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    // CHORD-113: normalize genres into a deduplicated list
    genreList: normalizeGenres(genres),
  };
}

/** CHORD-112: Autosave draft – persists identity fields without advancing the step. */
export async function saveIdentityDraft(formData: FormData) {
  saveDraft(extractIdentityFields(formData));
  // No redirect – stays on the same page with draft saved
}

export async function saveArtist(formData: FormData) {
  const fields = extractIdentityFields(formData);
  const { getArtist } = await import("../../../lib/artist");
  const current = getArtist();
  setArtist({ ...current, ...fields });

  // Advance onboarding state and redirect to next step
  const state = getOnboardingState();
  const next = advanceOnboarding(state, "profile");
  setOnboardingState(next);

  redirect(STEP_PATHS[next.currentStep]);
}
