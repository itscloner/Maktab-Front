import { Input, Select, type SelectProps } from "antd";
import { JalaliDatePicker } from "./JalaliDatePicker";
import type { UseQueryResult } from "@tanstack/react-query";
import type { ILookupItem } from "@/interface/ILookup";
import { toEnglishDigits, toOptions } from "@/utils/format";
import { errorMessage } from "@/lib/errors";

interface DigitsProps {
  value?: string | null;
  onChange: (v: string) => void;
  onBlur?: () => void;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
}

/** ورودی متنی که ارقام فارسی را به انگلیسی تبدیل می‌کند و فقط رقم می‌پذیرد */
export function DigitsInput({ value, onChange, ...rest }: DigitsProps) {
  return (
    <Input
      {...rest}
      inputMode="numeric"
      value={value ?? ""}
      onChange={(e) => onChange(toEnglishDigits(e.target.value).replace(/\D/g, ""))}
    />
  );
}

interface DateFieldProps {
  value?: string | null;
  onChange: (v: string | undefined) => void;
  showTime?: boolean;
  disabled?: boolean;
}

/** تاریخ شمسی انتخاب می‌شود و به‌صورت ISO میلادی نگهداری/ارسال می‌شود (قرارداد API: date-time) */
export function DateField({ value, onChange, showTime, disabled }: DateFieldProps) {
  return <JalaliDatePicker value={value} onChange={onChange} showTime={showTime} disabled={disabled} />;
}

interface LookupSelectProps extends Omit<SelectProps<number>, "options" | "loading" | "status"> {
  query: Pick<UseQueryResult<ILookupItem[]>, "data" | "isLoading" | "isError" | "error">;
}

/** Select مبتنی بر فهرست واقعی API؛ در صورت خطا پیام نمایش داده می‌شود. */
export function LookupSelect({ query, placeholder, ...rest }: LookupSelectProps) {
  return (
    <Select<number>
      showSearch
      allowClear
      optionFilterProp="label"
      style={{ width: "100%" }}
      {...rest}
      loading={query.isLoading}
      status={query.isError ? "error" : undefined}
      placeholder={query.isError ? errorMessage(query.error) : placeholder ?? "انتخاب کنید"}
      options={toOptions(query.data)}
    />
  );
}
