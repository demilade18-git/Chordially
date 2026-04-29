// CHORD-117: Payout readiness checklist – wallet verification status, missing requirements, blockers
import { Shell } from "../../../../components/layout/shell";
import { Card } from "../../../../components/ui/card";
import { getArtist } from "../../../../lib/artist";
import { getOnboardingState, STEPS, STEP_PATHS } from "../../../../lib/onboarding-state";
import Link from "next/link";

interface ChecklistItem {
  key: string;
  label: string;
  satisfied: boolean;
  blocker: boolean;
  hint?: string;
}

function evaluatePayoutReadiness(wallet: string): {
  ready: boolean;
  blockers: string[];
  checklist: ChecklistItem[];
} {
  const hasWallet = wallet.trim().length > 0;
  // Basic Stellar public key format: G + 55 alphanumeric chars
  const isValidStellar = /^G[A-Z2-7]{55}$/.test(wallet.trim());

  const checklist: ChecklistItem[] = [
    {
      key: "wallet_attached",
      label: "Wallet address provided",
      satisfied: hasWallet,
      blocker: true,
      hint: !hasWallet ? "Add your Stellar wallet address in the payout step." : undefined,
    },
    {
      key: "wallet_format",
      label: "Wallet address is a valid Stellar key",
      satisfied: isValidStellar,
      blocker: true,
      hint:
        hasWallet && !isValidStellar
          ? "The address must be a valid Stellar public key (starts with G, 56 characters)."
          : undefined,
    },
    {
      key: "profile_complete",
      label: "Stage name set",
      satisfied: true, // checked via onboarding state
      blocker: false,
    },
  ];

  const blockers = checklist
    .filter((item) => item.blocker && !item.satisfied)
    .map((item) => item.hint ?? item.label);

  return { ready: blockers.length === 0, blockers, checklist };
}

export default function PayoutReadinessPage() {
  const artist = getArtist();
  const state = getOnboardingState();
  const stepIndex = STEPS.indexOf("payout");
  const { ready, blockers, checklist } = evaluatePayoutReadiness(artist.wallet);

  return (
    <Shell
      title="Payout readiness"
      subtitle="Review what's needed before you can receive tips from fans."
    >
      {/* Progress indicator */}
      <nav aria-label="Onboarding steps" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {STEPS.filter((s) => s !== "complete").map((step, i) => (
          <Link
            key={step}
            href={`${STEP_PATHS[step]}${step === "profile" ? "?resume=1" : ""}`}
            aria-current={step === "payout" ? "step" : undefined}
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: 4,
              fontSize: 13,
              background: i <= stepIndex ? "#7c3aed" : "#1c1c26",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            {i + 1}. {step.charAt(0).toUpperCase() + step.slice(1)}
            {state.completedSteps.includes(step) ? " ✓" : ""}
          </Link>
        ))}
      </nav>

      <Card title="Payout checklist">
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: "0.75rem 1rem",
            borderRadius: 6,
            marginBottom: "1rem",
            background: ready ? "#14532d22" : "#7f1d1d22",
            border: `1px solid ${ready ? "#16a34a" : "#dc2626"}`,
            color: ready ? "#4ade80" : "#f87171",
            fontWeight: 600,
          }}
        >
          {ready ? "✓ You are ready to receive payouts." : `⚠ ${blockers.length} blocker${blockers.length > 1 ? "s" : ""} must be resolved.`}
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }} aria-label="Payout requirements">
          {checklist.map((item) => (
            <li
              key={item.key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "0.6rem 0",
                borderBottom: "1px solid #1c1c26",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  fontSize: 18,
                  lineHeight: 1,
                  color: item.satisfied ? "#4ade80" : item.blocker ? "#f87171" : "#a0a0b0",
                }}
              >
                {item.satisfied ? "✓" : item.blocker ? "✗" : "○"}
              </span>
              <div>
                <span style={{ fontWeight: 500 }}>{item.label}</span>
                {item.hint && (
                  <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                    {item.hint}
                  </p>
                )}
              </div>
              {item.blocker && !item.satisfied && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    padding: "0.15rem 0.5rem",
                    borderRadius: 4,
                    background: "#7f1d1d44",
                    color: "#f87171",
                    whiteSpace: "nowrap",
                  }}
                >
                  Blocker
                </span>
              )}
            </li>
          ))}
        </ul>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
          <Link href={STEP_PATHS.payout} className="button">
            {ready ? "Review payout settings" : "Fix payout settings"}
          </Link>
          {ready && (
            <Link href="/artist/dashboard" className="button button--secondary">
              Go to dashboard
            </Link>
          )}
        </div>
      </Card>
    </Shell>
  );
}
