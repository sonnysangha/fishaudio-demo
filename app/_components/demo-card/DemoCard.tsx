import type { ReactNode } from "react";

type DemoCardProps = {
  title: string;
  status: string;
  children: ReactNode;
  className?: string;
};

export function DemoCard({ title, status, children, className }: DemoCardProps) {
  // Every demo shares this shell so viewers can focus on the SDK calls.
  return (
    <section className={className ? `card ${className}` : "card"}>
      <div className="card-heading">
        <h2>{title}</h2>
        <span>{status}</span>
      </div>
      <div className="card-body">{children}</div>
    </section>
  );
}
