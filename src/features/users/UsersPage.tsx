import { useMemo, useState } from "react";
import { TeamOutlined } from "@ant-design/icons";
import { App, Button, Input, Popconfirm, Result, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useDeleteUser, useFetchRoles, useFetchUsers } from "@/api/user/_hook";
import { isUsersApiConfigured } from "@/api/user/_request";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { errorMessage } from "@/lib/errors";
import { lookupTitle, normalizeSearch, textOrDash } from "@/utils/format";
import type { IUser } from "@/interface/user/IUser";
import { UserFormDrawer } from "./UserFormDrawer";

export default function UsersPage() {
  if (!isUsersApiConfigured) {
    return (
      <>
        <PageHeader icon={<TeamOutlined />} title="مدیریت کاربران" />
        <Result
          status="info"
          title="Endpoint مدیریت کاربران تعریف نشده است"
          subTitle="در api.rar فقط User/login وجود دارد. مسیر واقعی را در VITE_USERS_ENDPOINT (و برای نقش‌ها VITE_ROLES_ENDPOINT) تنظیم کنید."
        />
      </>
    );
  }
  return <UsersContent />;
}

function UsersContent() {
  const { message } = App.useApp();
  const users = useFetchUsers();
  const roles = useFetchRoles();
  const del = useDeleteUser();
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<{ open: boolean; editing: IUser | null }>({ open: false, editing: null });

  const rows = useMemo(() => {
    const q = normalizeSearch(search);
    const all = users.data ?? [];
    if (!q) return all;
    return all.filter((u) => normalizeSearch(`${u.firstName} ${u.lastName} ${u.userName} ${u.mobile ?? ""}`).includes(q));
  }, [users.data, search]);

  const columns: ColumnsType<IUser> = [
    { title: "نام و نام خانوادگی", render: (_, u) => `${u.firstName} ${u.lastName}` },
    { title: "نام کاربری", dataIndex: "userName" },
    { title: "موبایل", dataIndex: "mobile", render: textOrDash },
    { title: "نقش", render: (_, u) => u.roleTitle ?? lookupTitle(roles.data, u.roleId) },
    {
      title: "عملیات",
      width: 120,
      render: (_, u) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} aria-label="ویرایش" onClick={() => setDrawer({ open: true, editing: u })} />
          <Popconfirm title="این کاربر حذف شود؟" okText="حذف" cancelText="انصراف" okButtonProps={{ danger: true }}
            onConfirm={() =>
              del.mutate(u.id, {
                onSuccess: () => message.success("کاربر حذف شد."),
                onError: (e) => message.error(errorMessage(e)),
              })
            }>
            <Button size="small" danger icon={<DeleteOutlined />} aria-label="حذف" loading={del.isPending && del.variables === u.id} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader icon={<TeamOutlined />} title="مدیریت کاربران" description="فهرست کاربران سامانه"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawer({ open: true, editing: null })}>کاربر جدید</Button>} />
      <Input.Search allowClear placeholder="جست‌وجو در فهرست بارگذاری‌شده" style={{ maxWidth: 320, marginBottom: 12 }}
        onChange={(e) => setSearch(e.target.value)} />
      <QueryState isLoading={users.isLoading} error={users.error} onRetry={() => users.refetch()}>
        <Table<IUser> rowKey="id" columns={columns} dataSource={rows} scroll={{ x: true }}
          locale={{ emptyText: "کاربری یافت نشد." }} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </QueryState>
      <UserFormDrawer open={drawer.open} editing={drawer.editing} onClose={() => setDrawer({ open: false, editing: null })} />
    </>
  );
}
