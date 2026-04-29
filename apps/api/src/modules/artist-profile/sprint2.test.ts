// Tests for CHORD-112, CHORD-113, CHORD-117, CHORD-123

import { evaluatePayoutReadiness } from "./payout-readiness.js";
import { attachWallet, verifyWallet } from "./wallet.js";
import { isProfileVisible, setModerationState, initModeration } from "./moderation.js";
import { buildPublicView, upsertPublicProfile } from "../../public-artist-profile.js";

type TestResult = { name: string; passed: boolean; error?: string };
const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (e) {
    results.push({ name, passed: false, error: String(e) });
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

// ── CHORD-113: Genre taxonomy normalization ──────────────────────────────────

function normalizeGenres(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((g) => g.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

test("CHORD-113: normalizes genres to lowercase deduplicated list", () => {
  const result = normalizeGenres("Afrobeats, Indie Soul, afrobeats");
  assert(result.length === 2, "should deduplicate");
  assert(result.every((g) => g === g.toLowerCase()), "should be lowercase");
});

test("CHORD-113: empty genre string returns empty list", () => {
  const result = normalizeGenres("");
  assert(result.length === 0, "empty string should yield empty list");
});

test("CHORD-113: trims whitespace from genre entries", () => {
  const result = normalizeGenres("  Jazz ,  Blues  ");
  assert(result.includes("jazz"), "should include trimmed jazz");
  assert(result.includes("blues"), "should include trimmed blues");
});

// ── CHORD-117: Payout readiness checklist ───────────────────────────────────

test("CHORD-117: artist with no wallet is not ready", () => {
  const result = evaluatePayoutReadiness("artist-no-wallet");
  assert(!result.ready, "should not be ready without wallet");
  assert(result.blockers.length > 0, "should have blockers");
  const walletItem = result.checklist.find((c) => c.key === "wallet_attached");
  assert(walletItem?.satisfied === false, "wallet_attached should be unsatisfied");
});

test("CHORD-117: artist with unverified wallet is not ready", () => {
  attachWallet({
    artistId: "artist-unverified",
    address: "GCFX3GM2V4N2O5NFEZ5XGUV3VZL57BC4Q43SGV5WW6H2I6J53GVL5W7W",
    network: "ethereum",
    verified: false,
    lastValidatedAt: null,
  });
  const result = evaluatePayoutReadiness("artist-unverified");
  assert(!result.ready, "should not be ready with unverified wallet");
  const verifiedItem = result.checklist.find((c) => c.key === "wallet_verified");
  assert(verifiedItem?.satisfied === false, "wallet_verified should be unsatisfied");
});

test("CHORD-117: artist with verified wallet is ready", () => {
  attachWallet({
    artistId: "artist-verified",
    address: "GCFX3GM2V4N2O5NFEZ5XGUV3VZL57BC4Q43SGV5WW6H2I6J53GVL5W7W",
    network: "ethereum",
    verified: false,
    lastValidatedAt: null,
  });
  verifyWallet("artist-verified");
  const result = evaluatePayoutReadiness("artist-verified");
  assert(result.ready, "should be ready with verified wallet");
  assert(result.blockers.length === 0, "should have no blockers");
});

test("CHORD-117: checklist includes all required items", () => {
  const result = evaluatePayoutReadiness("artist-checklist");
  const keys = result.checklist.map((c) => c.key);
  assert(keys.includes("wallet_attached"), "should include wallet_attached");
  assert(keys.includes("wallet_verified"), "should include wallet_verified");
});

// ── CHORD-123: Profile share links and metadata cards ───────────────────────

test("CHORD-123: buildPublicView includes shareUrl", () => {
  const profile = {
    artistId: "artist-share-1",
    slug: "nova-chords",
    stageName: "Nova Chords",
    bio: "Test bio",
    city: "Lagos",
    genres: ["afrobeats"],
    avatarUrl: null,
    bannerUrl: null,
    isLive: false,
    featuredMoments: [],
    supporterSummary: { totalSupporters: 0, topTipAmount: 0 },
  };
  upsertPublicProfile(profile);
  const view = buildPublicView(profile, "https://chordially.app");
  assert(view.shareUrl === "https://chordially.app/artists/nova-chords", "shareUrl should be correct");
});

test("CHORD-123: buildPublicView omits artistId", () => {
  const profile = {
    artistId: "artist-share-2",
    slug: "test-artist",
    stageName: "Test Artist",
    bio: "",
    city: "Accra",
    genres: [],
    avatarUrl: null,
    bannerUrl: null,
    isLive: false,
    featuredMoments: [],
    supporterSummary: { totalSupporters: 0, topTipAmount: 0 },
  };
  const view = buildPublicView(profile);
  assert(!("artistId" in view), "artistId must not be in public view");
});

test("CHORD-123: hidden profile is not visible", () => {
  initModeration("artist-hidden-share");
  setModerationState("artist-hidden-share", "hidden", "admin");
  assert(!isProfileVisible("artist-hidden-share"), "hidden profile must not be visible");
});

test("CHORD-123: active profile is visible", () => {
  initModeration("artist-active-share");
  assert(isProfileVisible("artist-active-share"), "active profile must be visible");
});

export function runSprintTests(): TestResult[] {
  const passed = results.filter((r) => r.passed).length;
  console.log(`Sprint 2 tests: ${passed}/${results.length} passed`);
  results.filter((r) => !r.passed).forEach((r) => console.error(`  FAIL: ${r.name} — ${r.error}`));
  return results;
}
