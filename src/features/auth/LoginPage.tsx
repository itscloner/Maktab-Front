import { useState, type CSSProperties } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Input, Typography } from "antd";
import {
  AuditOutlined, FolderOpenOutlined, LockOutlined, SafetyCertificateOutlined, TeamOutlined, UserOutlined,
} from "@ant-design/icons";
import { useLoginQuery } from "@/api/auth/_hook";
import { FormField } from "@/components/common/FormField";
import { errorMessage } from "@/lib/errors";
import { useAuth } from "./AuthContext";
import { extractToken } from "./extractToken";
import { loginSchema, type LoginFormValues } from "./schema";

const tile = (c1: string, c2: string, c3: string) => ({ "--c1": c1, "--c2": c2, "--c3": c3 }) as CSSProperties;

const FEATURES = [
  { icon: <TeamOutlined />, text: "مدیریت اشخاص و مددجویان", c: tile("#22d3ee", "#6366f1", "#3730a3") },
  { icon: <FolderOpenOutlined />, text: "پرونده‌ها و اطلاعات بانکی امن", c: tile("#f472b6", "#a855f7", "#6b21a8") },
  { icon: <SafetyCertificateOutlined />, text: "بررسی و تأیید درخواست‌ها با مستندات", c: tile("#34d399", "#06b6d4", "#0e7490") },
];

export default function LoginPage() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const [formError, setFormError] = useState<string | null>(null);
  const login = useLoginQuery();

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userName: "", password: "" },
  });

  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = handleSubmit((values) => {
    if (login.isPending) return; // جلوگیری از ارسال چندباره
    setFormError(null);
    login.mutate(
      { userName: values.userName.trim(), password: values.password },
      {
        onSuccess: (data) => {
          const token = extractToken(data);
          if (!token) {
            setFormError("ورود انجام شد ولی توکن در پاسخ سرور شناسایی نشد. ساختار پاسخ User/login را بررسی کنید.");
            return;
          }
          signIn(token, values.userName.trim());
          navigate(from, { replace: true });
        },
        onError: (e) => setFormError(errorMessage(e)),
      },
    );
  });

  return (
    <div className="login-root">
      <div className="login-grid">
        <div className="login-brand">
          <div className="icon-tile" style={{ ...tile("#22d3ee", "#6366f1", "#3730a3"), width: 72, height: 72, fontSize: 36, borderRadius: 22 }}>
            <AuditOutlined />
          </div>
          <h1>خیریه مکتب طه</h1>
          <p>سامانه‌ی یکپارچه برای ثبت درخواست‌ها، ساخت پرونده‌ها و رسیدگی دقیق به مددجویان؛ ساده، سریع و امن.</p>
          {FEATURES.map((f) => (
            <div className="login-feature" key={f.text}>
              <div className="icon-tile" style={f.c}>{f.icon}</div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        <div className="login-card">
          <div className="icon-tile login-logo" style={tile("#22d3ee", "#6366f1", "#3730a3")}>
            <AuditOutlined />
          </div>
          <Typography.Title level={3} style={{ textAlign: "center", margin: "0 0 4px" }}>
            خوش آمدید
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ textAlign: "center", marginBottom: 20 }}>
            برای ورود، اطلاعات حساب خود را وارد کنید.
          </Typography.Paragraph>
          {formError && <Alert type="error" showIcon message={formError} style={{ marginBottom: 16 }} />}
          <form onSubmit={onSubmit} noValidate>
            <FormField control={control} name="userName" label="نام کاربری" required
              render={(f) => <Input {...f} size="large" autoComplete="username" prefix={<UserOutlined />} autoFocus />} />
            <FormField control={control} name="password" label="رمز عبور" required
              render={(f) => <Input.Password {...f} size="large" autoComplete="current-password" prefix={<LockOutlined />} />} />
            <Button type="primary" htmlType="submit" block loading={login.isPending} style={{ marginTop: 8 }}>
              ورود به سامانه
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
