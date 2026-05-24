interface Props { fullScreen?: boolean; size?: 'sm' | 'md' | 'lg'; }

export default function LoadingSpinner({ fullScreen, size = 'md' }: Props) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const spinner = (
    <div className={`${sizeMap[size]} relative`}>
      <div className={`${sizeMap[size]} rounded-full border-2 border-transparent border-t-brand-500 animate-spin`} />
      <div className={`${sizeMap[size]} rounded-full border-2 border-transparent border-r-accent-500 animate-spin absolute inset-0`}
        style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        {spinner}
      </div>
    );
  }
  return spinner;
}
