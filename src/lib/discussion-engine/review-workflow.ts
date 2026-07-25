import { HumanReviewStatus } from "@/constants/discussion";
import type { HumanReviewStatus as HumanReviewStatusValue } from "@/types";

export const humanReviewTransitions: Record<
  HumanReviewStatusValue,
  HumanReviewStatusValue[]
> = {
  [HumanReviewStatus.Draft]: [HumanReviewStatus.AIGenerated, HumanReviewStatus.Archived],
  [HumanReviewStatus.AIGenerated]: [
    HumanReviewStatus.PendingReview,
    HumanReviewStatus.NeedsRevision,
  ],
  [HumanReviewStatus.PendingReview]: [
    HumanReviewStatus.Approved,
    HumanReviewStatus.Rejected,
    HumanReviewStatus.NeedsRevision,
  ],
  [HumanReviewStatus.Approved]: [HumanReviewStatus.Published, HumanReviewStatus.Archived],
  [HumanReviewStatus.Published]: [HumanReviewStatus.Archived],
  [HumanReviewStatus.Archived]: [],
  [HumanReviewStatus.Rejected]: [HumanReviewStatus.NeedsRevision, HumanReviewStatus.Archived],
  [HumanReviewStatus.NeedsRevision]: [
    HumanReviewStatus.AIGenerated,
    HumanReviewStatus.PendingReview,
    HumanReviewStatus.Rejected,
  ],
};

export function canTransitionHumanReviewStatus(
  from: HumanReviewStatusValue,
  to: HumanReviewStatusValue
) {
  return humanReviewTransitions[from].includes(to);
}

export function updateHumanReviewStatus<T extends { status: HumanReviewStatusValue }>(
  entity: T,
  nextStatus: HumanReviewStatusValue
): T {
  if (!canTransitionHumanReviewStatus(entity.status, nextStatus)) {
    throw new Error(`Invalid human review transition: ${entity.status} -> ${nextStatus}`);
  }

  return {
    ...entity,
    status: nextStatus,
  };
}
