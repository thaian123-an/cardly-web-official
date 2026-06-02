import { FileSearch } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <div className="empty-state__icon">
        <FileSearch size={30} strokeWidth={2.2} />
      </div>

      <h1>{title}</h1>

      {description ? <p>{description}</p> : null}
    </section>
  );
}