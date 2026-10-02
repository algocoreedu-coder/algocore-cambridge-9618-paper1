import type { ComponentPropsWithoutRef, ReactNode } from "react";

import styles from "./AlgoCoreUI.module.css";

type WithoutClassName<T> = Omit<T, "className">;

export type ButtonProps = WithoutClassName<ComponentPropsWithoutRef<"button">> & Readonly<{
  variant?: "primary" | "secondary" | "quiet" | "danger";
  size?: "regular" | "compact";
  loading?: boolean;
  loadingLabel?: string;
}>;

export function Button({ variant = "primary", size = "regular", loading = false, loadingLabel = "Working", disabled, children, ...props }: ButtonProps) {
  return <button {...props} type={props.type ?? "button"} className={styles.button} data-variant={variant} data-size={size} disabled={disabled || loading} aria-busy={loading || undefined}>
    {loading && <span className={styles.spinner} aria-hidden="true" />}
    {loading && <span className={styles.srOnly}>{loadingLabel}</span>}
    <span aria-hidden={loading || undefined}>{children}</span>
  </button>;
}

export type IconButtonProps = WithoutClassName<ComponentPropsWithoutRef<"button">> & Readonly<{
  label: string;
  icon: ReactNode;
}>;

export function IconButton({ label, icon, ...props }: IconButtonProps) {
  return <button {...props} type={props.type ?? "button"} className={styles.iconButton} aria-label={label}>{icon}</button>;
}

type FieldBase = Readonly<{ id: string; label: string; description?: string; error?: string }>;

function FieldMessages({ id, description, error }: Readonly<{ id: string; description?: string; error?: string }>) {
  return <>{description && <p className={styles.description} id={`${id}-description`}>{description}</p>}{error && <p className={styles.error} id={`${id}-error`} role="alert">{error}</p>}</>;
}

function describedBy(id: string, description?: string, error?: string) {
  return [description ? `${id}-description` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
}

export type FieldProps = WithoutClassName<ComponentPropsWithoutRef<"input">> & FieldBase;
export function Field({ id, label, description, error, ...props }: FieldProps) {
  return <div className={styles.field}><label htmlFor={id}>{label}</label><FieldMessages id={id} description={description} error={error} /><input {...props} id={id} aria-describedby={describedBy(id, description, error)} aria-invalid={Boolean(error) || undefined} /></div>;
}

export type SelectProps = WithoutClassName<ComponentPropsWithoutRef<"select">> & FieldBase;
export function Select({ id, label, description, error, children, ...props }: SelectProps) {
  return <div className={styles.field}><label htmlFor={id}>{label}</label><FieldMessages id={id} description={description} error={error} /><select {...props} id={id} aria-describedby={describedBy(id, description, error)} aria-invalid={Boolean(error) || undefined}>{children}</select></div>;
}

export type TextareaProps = WithoutClassName<ComponentPropsWithoutRef<"textarea">> & FieldBase;
export function Textarea({ id, label, description, error, ...props }: TextareaProps) {
  return <div className={styles.field}><label htmlFor={id}>{label}</label><FieldMessages id={id} description={description} error={error} /><textarea {...props} id={id} aria-describedby={describedBy(id, description, error)} aria-invalid={Boolean(error) || undefined} /></div>;
}

export type Choice = Readonly<{ id: string; label: string; description?: string; disabled?: boolean }>;
export type ChoiceGroupProps = Readonly<{
  legend: string;
  name: string;
  choices: readonly Choice[];
  value?: string;
  description?: string;
  error?: string;
  onChange?: (value: string) => void;
}>;

export function ChoiceGroup({ legend, name, choices, value, description, error, onChange }: ChoiceGroupProps) {
  const describedById = `${name}-choice-description`;
  return <fieldset className={styles.fieldGroup} aria-describedby={description || error ? describedById : undefined} aria-invalid={Boolean(error) || undefined}>
    <legend>{legend}</legend>
    {(description || error) && <div id={describedById}>{description && <p className={styles.description}>{description}</p>}{error && <p className={styles.error} role="alert">{error}</p>}</div>}
    <div className={styles.choices}>{choices.map((choice) => <label className={styles.choice} key={choice.id}><input type="radio" name={name} value={choice.id} checked={value === choice.id} disabled={choice.disabled} onChange={() => onChange?.(choice.id)} /><span>{choice.label}{choice.description && <small>{choice.description}</small>}</span></label>)}</div>
  </fieldset>;
}
