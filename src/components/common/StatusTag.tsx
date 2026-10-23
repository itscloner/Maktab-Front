import { Tag } from "antd";

const PALETTE = ["blue", "green", "orange", "red", "purple", "cyan", "gold", "magenta", "geekblue", "lime"];

/** رنگ فقط بر اساس شناسه تعیین می‌شود تا برداشتی درباره معنی وضعیت‌ها فرض نشود؛ متن از API می‌آید. */
export function StatusTag({ id, title }: { id?: number | null; title?: string | null }) {
  if (id === undefined || id === null) return <>—</>;
  return <Tag color={PALETTE[Math.abs(id) % PALETTE.length]}>{title ?? `وضعیت ${id}`}</Tag>;
}
