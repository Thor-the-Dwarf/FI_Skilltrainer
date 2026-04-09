export const VAULT_LOD_TIERS = Object.freeze({
  PROXY: "proxy",
  NEAR: "near",
  FOCUSED: "focused"
});

export const DEFAULT_VAULT_LOD_CONFIG = Object.freeze({
  enterDistance: 8,
  exitDistance: 10
});

function toFinitePositiveNumber(value, fallback) {
  const normalizedValue = Number(value);
  return Number.isFinite(normalizedValue) && normalizedValue > 0
    ? normalizedValue
    : fallback;
}

function normalizePreviousTier(previousTier) {
  return previousTier === VAULT_LOD_TIERS.NEAR
    || previousTier === VAULT_LOD_TIERS.FOCUSED
    || previousTier === VAULT_LOD_TIERS.PROXY
    ? previousTier
    : VAULT_LOD_TIERS.PROXY;
}

export function normalizeVaultLodConfig(config = {}, defaults = DEFAULT_VAULT_LOD_CONFIG) {
  const fallbackEnterDistance = toFinitePositiveNumber(
    defaults?.enterDistance,
    DEFAULT_VAULT_LOD_CONFIG.enterDistance
  );
  const requestedEnterDistance = toFinitePositiveNumber(
    config?.enterDistance,
    fallbackEnterDistance
  );

  const fallbackExitDistance = toFinitePositiveNumber(
    defaults?.exitDistance,
    Math.max(
      fallbackEnterDistance,
      DEFAULT_VAULT_LOD_CONFIG.exitDistance
    )
  );
  const requestedExitDistance = toFinitePositiveNumber(
    config?.exitDistance,
    fallbackExitDistance
  );

  const enterDistance = Math.min(requestedEnterDistance, requestedExitDistance);
  const exitDistance = Math.max(requestedEnterDistance, requestedExitDistance);

  return Object.freeze({
    enterDistance,
    exitDistance
  });
}

export function resolveVaultLodTier({
  distance,
  previousTier = VAULT_LOD_TIERS.PROXY,
  isFocused = false,
  config,
  defaults
} = {}) {
  if (isFocused) {
    return VAULT_LOD_TIERS.FOCUSED;
  }

  const normalizedConfig = normalizeVaultLodConfig(config, defaults);
  const normalizedPreviousTier = normalizePreviousTier(previousTier);
  const normalizedDistance = Number(distance);

  if (!Number.isFinite(normalizedDistance)) {
    return normalizedPreviousTier === VAULT_LOD_TIERS.FOCUSED
      ? VAULT_LOD_TIERS.NEAR
      : normalizedPreviousTier;
  }

  if (
    normalizedPreviousTier === VAULT_LOD_TIERS.NEAR
    || normalizedPreviousTier === VAULT_LOD_TIERS.FOCUSED
  ) {
    return normalizedDistance <= normalizedConfig.exitDistance
      ? VAULT_LOD_TIERS.NEAR
      : VAULT_LOD_TIERS.PROXY;
  }

  return normalizedDistance <= normalizedConfig.enterDistance
    ? VAULT_LOD_TIERS.NEAR
    : VAULT_LOD_TIERS.PROXY;
}
