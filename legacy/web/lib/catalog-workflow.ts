export type CatalogRole =
  | "collector"
  | "mycologist"
  | "scientificCurator"
  | "systemAdmin";

export type ChangeCriticality = "ordinary" | "critical";
export type ChangeStatus =
  | "draft"
  | "submitted"
  | "inReview"
  | "changesRequested"
  | "approved"
  | "rejected"
  | "published"
  | "superseded";
export type ReviewDecision = "approve" | "reject" | "requestChanges";

export type ReviewStateInput = {
  criticality: ChangeCriticality;
  authorId: string;
  mycologistReviewerId?: string;
  mycologistDecision?: ReviewDecision;
  scientificReviewerId?: string;
  scientificDecision?: ReviewDecision;
};

export function nextChangeStatus(input: ReviewStateInput): ChangeStatus {
  if (input.mycologistDecision === "reject" || input.scientificDecision === "reject") {
    return "rejected";
  }
  if (
    input.mycologistDecision === "requestChanges" ||
    input.scientificDecision === "requestChanges"
  ) {
    return "changesRequested";
  }
  if (
    input.mycologistDecision !== "approve" ||
    !input.mycologistReviewerId ||
    input.mycologistReviewerId === input.authorId
  ) {
    return "inReview";
  }
  if (input.criticality === "ordinary") return "approved";
  if (
    input.scientificDecision === "approve" &&
    input.scientificReviewerId &&
    input.scientificReviewerId !== input.authorId &&
    input.scientificReviewerId !== input.mycologistReviewerId
  ) {
    return "approved";
  }
  return "inReview";
}
