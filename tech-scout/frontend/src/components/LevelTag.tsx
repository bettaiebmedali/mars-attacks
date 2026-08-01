const LEVEL_ICON: Record<string, string> = {
  BEGINNER: "\u{1F331}",
  ADVANCED: "\u{1F525}",
  EXPERT: "\u{1F3C6}",
};

export function LevelTag({ level }: { level: string }) {
  const icon = LEVEL_ICON[level.toUpperCase()] ?? "✨";
  return (
    <span className={`level-tag level-${level.toLowerCase()}`}>
      <span aria-hidden="true">{icon}</span>
      {level}
    </span>
  );
}
