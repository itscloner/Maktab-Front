import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Result status="404" title="۴۰۴" subTitle="صفحه موردنظر پیدا نشد."
      extra={<Button type="primary" onClick={() => navigate("/")}>بازگشت به داشبورد</Button>} />
  );
}

export function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <Result status="403" title="۴۰۳" subTitle="شما به این بخش دسترسی ندارید."
      extra={<Button type="primary" onClick={() => navigate("/")}>بازگشت به داشبورد</Button>} />
  );
}
