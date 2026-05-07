export type AppVersionInfo = {
  appVersion?: string;
  shortSha?: string;
  label: string;
};

export function getAppVersionInfo(): AppVersionInfo {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION?.trim();
  const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.trim();
  const shortSha = commitSha ? commitSha.slice(0, 7) : undefined;

  if (appVersion && shortSha) {
    return {
      appVersion,
      shortSha,
      label: `版本：v${appVersion} · ${shortSha}`,
    };
  }

  if (appVersion) {
    return {
      appVersion,
      label: `版本：v${appVersion}`,
    };
  }

  if (shortSha) {
    return {
      shortSha,
      label: `版本：${shortSha}`,
    };
  }

  return {
    label: '版本：development',
  };
}
