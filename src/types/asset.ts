import type { CharacterId, DepartmentId } from "@/types/organization";

export type AssetCategory =
  | "Brand Asset"
  | "Character Asset"
  | "UI Asset"
  | "Content Asset"
  | "Marketing Asset"
  | "Source File"
  | "Motion Asset"
  | "Audio Asset";

export type AssetInventoryItem = {
  id: string;
  name: string;
  category: AssetCategory;
  version: string;
  status: "Draft" | "Review" | "Approved" | "Active" | "Deprecated" | "Archived";
  usage: string[];
  fileUrl?: string;
  sourceFileUrl?: string;
  relatedCharacterId?: CharacterId;
  relatedDepartmentId?: DepartmentId;
  relatedProductId?: string;
  updatedAt: string;
};
