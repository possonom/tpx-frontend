// src/domain/index.ts
// Re-export all domain entities for easier imports
export * from "./entities/shared";
export * from "./entities/Practice";
export * from "./entities/Pharmacy";
export * from "./entities/Transaction";

// Type guards
export function isMedicalPractice(
  asset: MedicalPractice | Pharmacy
): asset is MedicalPractice {
  return "specialization" in asset;
}

export function isPharmacy(
  asset: MedicalPractice | Pharmacy
): asset is Pharmacy {
  return "licenses" in asset && Array.isArray(asset.licenses);
}
