// CHORD-117: Payout readiness checklist – wallet verification status, missing requirements, blockers

import type { Router } from "express";
import { getWallet } from "./wallet.js";

export interface PayoutChecklistItem {
  key: string;
  label: string;
  satisfied: boolean;
  blocker: boolean;
  hint?: string;
}

export interface PayoutReadiness {
  artistId: string;
  ready: boolean;
  blockers: string[];
  checklist: PayoutChecklistItem[];
  evaluatedAt: string;
}

export function evaluatePayoutReadiness(artistId: string): PayoutReadiness {
  const wallet = getWallet(artistId);

  const checklist: PayoutChecklistItem[] = [
    {
      key: "wallet_attached",
      label: "Wallet address attached",
      satisfied: wallet !== null,
      blocker: true,
      hint: wallet === null ? "Attach a Stellar wallet address to receive tips." : undefined,
    },
    {
      key: "wallet_verified",
      label: "Wallet address verified",
      satisfied: wallet?.verified === true,
      blocker: true,
      hint:
        wallet && !wallet.verified
          ? "Your wallet has not been verified yet. Complete the verification step."
          : undefined,
    },
    {
      key: "wallet_network",
      label: "Wallet on supported network",
      satisfied:
        wallet?.network === "solana" ||
        wallet?.network === "polygon" ||
        wallet?.network === "ethereum",
      blocker: false,
      hint:
        wallet && !["solana", "polygon", "ethereum"].includes(wallet.network)
          ? "Unsupported wallet network."
          : undefined,
    },
  ];

  const blockers = checklist
    .filter((item) => item.blocker && !item.satisfied)
    .map((item) => item.hint ?? item.label);

  return {
    artistId,
    ready: blockers.length === 0,
    blockers,
    checklist,
    evaluatedAt: new Date().toISOString(),
  };
}

export function registerPayoutReadinessRoutes(router: Router): void {
  router.get("/artists/:artistId/payout-readiness", (req, res) => {
    const { artistId } = req.params;
    const result = evaluatePayoutReadiness(artistId);
    console.info("[payout] readiness evaluated", { artistId, ready: result.ready });
    res.json(result);
  });
}
