import type { ReactNode } from "react";
import { Alert, Button, Result, Spin } from "antd";
import { errorMessage } from "@/lib/errors";

interface Props {
  isLoading: boolean;
  error: unknown;
  onRetry?: () => void;
  children: ReactNode;
}

/** نمایش یکسان Loading و Error؛ در حالت خطا، داده قبلی به‌عنوان داده جدید نمایش داده نمی‌شود. */
export function QueryState({ isLoading, error, onRetry, children }: Props) {
  if (isLoading) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <Spin size="large" tip="در حال دریافت اطلاعات..." />
      </div>
    );
  }
  if (error) {
    return (
      <Result
        status="warning"
        title="دریافت اطلاعات ناموفق بود"
        subTitle={errorMessage(error)}
        extra={onRetry && <Button onClick={onRetry}>تلاش مجدد</Button>}
      />
    );
  }
  return <>{children}</>;
}

export function InlineError({ error }: { error: unknown }) {
  return <Alert type="error" showIcon message={errorMessage(error)} style={{ marginBottom: 12 }} />;
}
