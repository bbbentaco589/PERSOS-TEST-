export type DeploymentMode = "preview" | "production";

export function getDeploymentMode(): DeploymentMode {
  return process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === "preview" ? "preview" : "production";
}

export function isPreviewDeployment() {
  return getDeploymentMode() === "preview";
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim();
  const candidate = configuredUrl || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");

  try {
    return new URL(candidate);
  } catch {
    return new URL("http://localhost:3000");
  }
}
