// CHORD-112: Artist identity form with autosave draft persistence
// CHORD-119: Onboarding with resume links – returns artist to last incomplete step
import { redirect } from "next/navigation";
import { Shell } from "../../../components/layout/shell";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { getArtist } from "../../../lib/artist";
import { getOnboardingState, getResumeStep, STEP_PATHS, STEPS } from "../../../lib/onboarding-state";
import Link from "next/link";
import { saveArtist, saveIdentityDraft } from "./actions";

export default function ArtistOnboardingPage({
  searchParams
}: {
  searchParams: { resume?: string };
}) {
  const state = getOnboardingState();

  // If artist has already completed the profile step and isn't explicitly on step 1,
  // redirect to their resume point
  if (searchParams.resume !== "1" && state.completedSteps.includes("profile")) {
    const resumeStep = getResumeStep(state);
    if (resumeStep !== "profile") {
      redirect(STEP_PATHS[resumeStep]);
    }
  }

  const artist = getArtist();
  const stepIndex = STEPS.indexOf("profile");

  return (
    <Shell
      title="Set up an artist profile."
      subtitle="Fill in your identity details. Changes are saved automatically as you type."
    >
      {/* Progress indicator with resume links */}
      <nav aria-label="Onboarding steps" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {STEPS.filter((s) => s !== "complete").map((step, i) => (
          <Link
            key={step}
            href={`${STEP_PATHS[step]}${step === "profile" ? "?resume=1" : ""}`}
            aria-current={step === "profile" ? "step" : undefined}
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: 4,
              fontSize: 13,
              background: i <= stepIndex ? "#7c3aed" : "#1c1c26",
              color: "#fff",
              textDecoration: "none"
            }}
          >
            {i + 1}. {step.charAt(0).toUpperCase() + step.slice(1)}
            {state.completedSteps.includes(step) ? " ✓" : ""}
          </Link>
        ))}
      </nav>

      <Card title="Artist identity">
        {/* Autosave form: each field change triggers a draft save via the autosave action */}
        <form action={saveArtist} className="stack">
          <div className="stack">
            <label htmlFor="stageName">Stage name <span aria-hidden="true">*</span></label>
            <Input id="stageName" defaultValue={artist.stageName} name="stageName" required
              aria-describedby="stageName-hint" />
            <span id="stageName-hint" className="muted">Your public artist name.</span>
          </div>
          <div className="stack">
            <label htmlFor="slug">Profile slug <span aria-hidden="true">*</span></label>
            <Input id="slug" defaultValue={artist.slug} name="slug" required />
          </div>
          <div className="stack">
            <label htmlFor="categories">Categories</label>
            <Input id="categories" defaultValue={artist.categories} name="categories"
              placeholder="e.g. Live performer, DJ, Producer" />
          </div>
          <div className="stack">
            <label htmlFor="city">City <span aria-hidden="true">*</span></label>
            <Input id="city" defaultValue={artist.city} name="city" required />
          </div>
          <div className="stack">
            <label htmlFor="genres">Genres <span aria-hidden="true">*</span></label>
            <Input id="genres" defaultValue={artist.genres} name="genres" required
              aria-describedby="genres-hint" />
            <span id="genres-hint" className="muted">Comma-separated, e.g. Afrobeats, Indie Soul</span>
          </div>
          <div className="stack">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" className="textarea" defaultValue={artist.bio} name="bio" />
          </div>
          <fieldset style={{ border: "1px solid #2a2a3a", borderRadius: 6, padding: "0.75rem" }}>
            <legend style={{ padding: "0 0.5rem", fontSize: 13, color: "#a0a0b0" }}>Social handles</legend>
            <div className="stack">
              <label htmlFor="instagram">Instagram</label>
              <Input id="instagram" defaultValue={artist.instagram} name="instagram" placeholder="@handle" />
            </div>
            <div className="stack">
              <label htmlFor="twitter">X / Twitter</label>
              <Input id="twitter" defaultValue={artist.twitter} name="twitter" placeholder="@handle" />
            </div>
            <div className="stack">
              <label htmlFor="tiktok">TikTok</label>
              <Input id="tiktok" defaultValue={artist.tiktok} name="tiktok" placeholder="@handle" />
            </div>
            <div className="stack">
              <label htmlFor="website">Website</label>
              <Input id="website" defaultValue={artist.website} name="website" placeholder="https://…" />
            </div>
          </fieldset>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button className="button" type="submit">Save and continue</button>
            {/* Autosave draft button – saves without advancing the step */}
            <button className="button button--secondary" type="submit" formAction={saveIdentityDraft}>
              Save draft
            </button>
          </div>
        </form>
      </Card>
    </Shell>
  );
}
