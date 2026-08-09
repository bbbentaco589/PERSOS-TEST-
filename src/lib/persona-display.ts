import type { Employee } from "@/types";

/** Public UI policy: persona names are always rendered as 국문(English). */
export function formatPersonaDisplayName(
  employee: Pick<Employee, "nameKo" | "nameEn">
) {
  const koreanName = employee.nameKo.trim();
  const englishName = employee.nameEn.trim();

  if (!englishName || koreanName.endsWith(`(${englishName})`)) {
    return koreanName;
  }

  return `${koreanName}(${englishName})`;
}
