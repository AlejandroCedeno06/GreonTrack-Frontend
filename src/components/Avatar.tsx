function getInitials(nombre: string | null | undefined, email: string | null | undefined) {
  const source = nombre?.trim() || email?.trim() || '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface AvatarProps {
  nombre?: string | null;
  email?: string | null;
  size?: number;
}

export function Avatar({ nombre, email, size = 40 }: AvatarProps) {
  const initials = getInitials(nombre, email);
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      title={nombre ?? email ?? undefined}
    >
      {initials}
    </div>
  );
}
