import { Input, InputNumber, Switch } from "antd";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useLookup, useCities } from "@/api/base/_hooks";
import type { LookupKey } from "@/api/base/_requests";
import { FormField } from "./FormField";
import { DateField, DigitsInput, LookupSelect } from "./inputs";

type Kind = "text" | "textarea" | "digits" | "number" | "date" | "datetime" | "password";

interface FieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  kind?: Kind;
  required?: boolean;
  help?: string;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
}

/** فیلد عمومی فرم؛ مقدار هر Kind با نوع داده Schema هماهنگ است. */
export function Field<T extends FieldValues>({
  control, name, label, kind = "text", required, help, maxLength, placeholder, disabled,
}: FieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      required={required}
      help={help}
      render={(f) => {
        switch (kind) {
          case "textarea":
            return <Input.TextArea {...f} value={(f.value as string | undefined) ?? ""} rows={3} maxLength={maxLength} disabled={disabled} />;
          case "digits":
            return <DigitsInput value={f.value as string | undefined} onChange={f.onChange} onBlur={f.onBlur} maxLength={maxLength} placeholder={placeholder} disabled={disabled} />;
          case "number":
            return (
              <InputNumber
                style={{ width: "100%" }}
                value={(f.value as number | null | undefined) ?? null}
                onChange={(v) => f.onChange(v ?? undefined)}
                onBlur={f.onBlur}
                disabled={disabled}
                placeholder={placeholder}
              />
            );
          case "date":
          case "datetime":
            return <DateField value={f.value as string | undefined} onChange={f.onChange} showTime={kind === "datetime"} disabled={disabled} />;
          case "password":
            return <Input.Password {...f} value={(f.value as string | undefined) ?? ""} autoComplete="new-password" disabled={disabled} />;
          default:
            return <Input {...f} value={(f.value as string | undefined) ?? ""} maxLength={maxLength} placeholder={placeholder} disabled={disabled} />;
        }
      }}
    />
  );
}

interface LookupFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  lookup: LookupKey;
  required?: boolean;
  onValueChange?: (v: number | undefined) => void;
}

export function LookupField<T extends FieldValues>({ control, name, label, lookup, required, onValueChange }: LookupFieldProps<T>) {
  const query = useLookup(lookup);
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      required={required}
      render={(f) => (
        <LookupSelect
          query={query}
          value={(f.value as number | null | undefined) ?? undefined}
          onBlur={f.onBlur}
          onChange={(v) => {
            f.onChange(v);
            onValueChange?.(v);
          }}
        />
      )}
    />
  );
}

interface CityFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  provinceId?: number | null;
  required?: boolean;
}

/** شهرها فقط پس از انتخاب استان و از Endpoint همان استان دریافت می‌شوند. */
export function CityField<T extends FieldValues>({ control, name, label = "شهر", provinceId, required }: CityFieldProps<T>) {
  const query = useCities(provinceId);
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      required={required}
      render={(f) => (
        <LookupSelect
          query={query}
          disabled={!provinceId}
          placeholder={provinceId ? "انتخاب شهر" : "ابتدا استان را انتخاب کنید"}
          value={(f.value as number | null | undefined) ?? undefined}
          onBlur={f.onBlur}
          onChange={f.onChange}
        />
      )}
    />
  );
}

interface SwitchFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
}

export function SwitchField<T extends FieldValues>({ control, name, label }: SwitchFieldProps<T>) {
  return (
    <FormField control={control} name={name} label={label}
      render={(f) => <Switch checked={!!f.value} onChange={f.onChange} />} />
  );
}
