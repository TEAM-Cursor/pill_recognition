import type { Attachment } from "../lib/types";

export default function AttachmentChip({ att }: { att: Attachment }) {
  if (att.kind === "image") {
    return (
      <a className="att-chip" href={att.url} target="_blank" rel="noreferrer" title={att.name}>
        <img src={att.url} alt={att.name} />
      </a>
    );
  }
  return (
    <a className="att-chip" href={att.url} target="_blank" rel="noreferrer">
      <span>{att.kind === "link" ? "🔗" : "📄"}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</span>
    </a>
  );
}
