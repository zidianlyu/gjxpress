import { getAppVersionInfo } from '@/lib/app-version';
import { cn } from '@/lib/utils';

type AppVersionBadgeProps = {
  className?: string;
};

export function AppVersionBadge({ className }: AppVersionBadgeProps) {
  const version = getAppVersionInfo();

  return (
    <span className={cn('text-xs text-muted-foreground', className)}>
      {version.label}
    </span>
  );
}
