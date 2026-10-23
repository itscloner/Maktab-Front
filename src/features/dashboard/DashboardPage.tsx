import type { CSSProperties, ReactNode } from "react";
import { Alert, Card, Col, Row, Space, Spin, Tag } from "antd";
import { DashboardOutlined, FolderOpenOutlined, IdcardOutlined, InboxOutlined, TeamOutlined } from "@ant-design/icons";
import { useFetchRequests } from "@/api/request/_hook";
import { useFetchCases } from "@/api/case/_hook";
import { useFetchPersons } from "@/api/person/_hook";
import { useFetchUsers } from "@/api/user/_hook";
import { isUsersApiConfigured } from "@/api/user/_request";
import { PageHeader } from "@/components/common/PageHeader";
import { errorMessage } from "@/lib/errors";

interface Q { isLoading: boolean; error: unknown; data?: unknown[] }

const PALETTES = {
  indigo: ["#6366f1", "#8b5cf6", "#3730a3"],
  cyan: ["#06b6d4", "#3b82f6", "#1d4ed8"],
  pink: ["#ec4899", "#f97316", "#be185d"],
  green: ["#10b981", "#06b6d4", "#047857"],
} as const;

function Stat({ title, icon, q, palette }: { title: string; icon: ReactNode; q: Q; palette: keyof typeof PALETTES }) {
  const [c1, c2, c3] = PALETTES[palette];
  return (
    <Col xs={24} sm={12} xl={6}>
      <div className="stat-3d" style={{ "--c1": c1, "--c2": c2, "--c3": c3 } as CSSProperties}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ opacity: .9 }}>{title}</div>
            {q.error ? <div style={{ fontSize: 12 }}>{errorMessage(q.error)}</div>
              : <div className="stat-num">{q.isLoading ? <Spin size="small" /> : (q.data?.length ?? 0).toLocaleString("fa-IR")}</div>}
          </div>
          <span className="stat-icon">{icon}</span>
        </div>
      </div>
    </Col>
  );
}

/** آمار از طول فهرست‌های واقعی API محاسبه می‌شود (Endpoint آمار تجمیعی وجود ندارد). */
export default function DashboardPage() {
  const requests = useFetchRequests();
  const cases = useFetchCases();
  const persons = useFetchPersons();
  const users = useFetchUsers();

  const byStatus = new Map<string, number>();
  (requests.data ?? []).forEach((r) => {
    const k = r.requestStatusTitle ?? `وضعیت ${r.requestStatusId}`;
    byStatus.set(k, (byStatus.get(k) ?? 0) + 1);
  });

  return (
    <>
      <PageHeader icon={<DashboardOutlined />} title="داشبورد" description="خلاصه‌ای از اطلاعات ثبت‌شده در سامانه" />
      <Row gutter={[20, 24]}>
        <Stat title="درخواست‌ها" icon={<InboxOutlined />} q={requests} palette="indigo" />
        <Stat title="پرونده‌ها" icon={<FolderOpenOutlined />} q={cases} palette="cyan" />
        <Stat title="اشخاص" icon={<IdcardOutlined />} q={persons} palette="pink" />
        {isUsersApiConfigured
          ? <Stat title="کاربران" icon={<TeamOutlined />} q={users} palette="green" />
          : <Col xs={24} sm={12} xl={6}><Alert type="info" showIcon message="آمار کاربران: Endpoint کاربران تنظیم نشده است." /></Col>}
      </Row>
      <Card title="درخواست‌ها بر اساس وضعیت" style={{ marginTop: 28 }} loading={requests.isLoading}>
        {byStatus.size === 0 ? "درخواستی ثبت نشده است." : (
          <Space wrap>{[...byStatus].map(([k, n]) => <Tag key={k} color="geekblue" style={{ padding: "4px 12px", fontSize: 14 }}>{`${k}: ${n.toLocaleString("fa-IR")}`}</Tag>)}</Space>
        )}
      </Card>
    </>
  );
}
