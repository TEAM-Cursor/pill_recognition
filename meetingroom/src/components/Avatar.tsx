import type { Member } from "../lib/types";

export default function Avatar({ member, size = 32 }: { member: Member | null; size?: number }) {
  const name = member?.name ?? "?";
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: member?.color ?? "#555", fontSize: size * 0.42 }}
      title={name}
    >
      {name.slice(0, 1)}
    </span>
  );
}
