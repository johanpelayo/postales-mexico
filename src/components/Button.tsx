import { Link, type LinkProps } from "react-router-dom";
import type { ButtonHTMLAttributes } from "react";
type Tone = "primary" | "secondary" | "ghost" | "inverse";
export function Button({
  tone = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button className={`button button--${tone} ${className}`} {...props} />
  );
}
export function ButtonLink({
  tone = "primary",
  className = "",
  ...props
}: LinkProps & { tone?: Tone }) {
  return <Link className={`button button--${tone} ${className}`} {...props} />;
}
