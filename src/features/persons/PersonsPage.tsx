import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IdcardOutlined } from "@ant-design/icons";
import { App, Button, Descriptions, Drawer, Input, Popconfirm, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { useDeletePersonQuery, useFetchPerson, useFetchPersons } from "@/api/person/_hook";
import { useLookup } from "@/api/base/_hooks";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { errorMessage } from "@/lib/errors";
import { formatDateFa, lookupTitle, normalizeSearch, textOrDash } from "@/utils/format";
import type { IPerson } from "@/interface/person/IPerson";
import { PersonFormDrawer } from "./PersonFormDrawer";

export default function PersonsPage() {
  const { message } = App.useApp();
  const persons = useFetchPersons();
  const del = useDeletePersonQuery();
  const gender = useLookup("gender");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<{ open: boolean; editing: IPerson | null }>({ open: false, editing: null });
  const [detailId, setDetailId] = useState<number | null>(null);
  const [sp, setSp] = useSearchParams();
  useEffect(() => {
    if (sp.get("new") === "1") {
      setForm({ open: true, editing: null });
      setSp({}, { replace: true });
    }
  }, [sp, setSp]);

  const rows = useMemo(() => {
    const q = normalizeSearch(search);
    const all = persons.data ?? [];
    if (!q) return all;
    return all.filter((p) => normalizeSearch(`${p.firstName} ${p.lastName} ${p.nationalCode} ${p.mobile ?? ""}`).includes(q));
  }, [persons.data, search]);

  const columns: ColumnsType<IPerson> = [
    { title: "کد ملی", dataIndex: "nationalCode" },
    { title: "نام و نام خانوادگی", render: (_, p) => `${p.firstName} ${p.lastName}` },
    { title: "نام پدر", dataIndex: "fatherName", render: textOrDash },
    { title: "جنسیت", render: (_, p) => lookupTitle(gender.data, p.genderId) },
    { title: "موبایل", dataIndex: "mobile", render: textOrDash },
    {
      title: "عملیات",
      width: 150,
      render: (_, p) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} aria-label="جزئیات" onClick={() => setDetailId(p.id ?? null)} />
          <Button size="small" icon={<EditOutlined />} aria-label="ویرایش" onClick={() => setForm({ open: true, editing: p })} />
          <Popconfirm title="این شخص حذف شود؟" okText="حذف" cancelText="انصراف" okButtonProps={{ danger: true }}
            onConfirm={() => p.id !== undefined && del.mutate(p.id, {
              onSuccess: () => message.success("شخص حذف شد."),
              onError: (e) => message.error(errorMessage(e)),
            })}>
            <Button size="small" danger icon={<DeleteOutlined />} aria-label="حذف" loading={del.isPending && del.variables === p.id} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader icon={<IdcardOutlined />} title="مدیریت اشخاص" description="اشخاص مرتبط با پرونده‌های خیریه"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setForm({ open: true, editing: null })}>شخص جدید</Button>} />
      <Input.Search allowClear placeholder="جست‌وجو در فهرست بارگذاری‌شده (نام، کد ملی، موبایل)" style={{ maxWidth: 360, marginBottom: 12 }}
        onChange={(e) => setSearch(e.target.value)} />
      <QueryState isLoading={persons.isLoading} error={persons.error} onRetry={() => persons.refetch()}>
        <Table<IPerson> rowKey="id" columns={columns} dataSource={rows} scroll={{ x: true }}
          locale={{ emptyText: "شخصی یافت نشد." }} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </QueryState>
      <PersonFormDrawer open={form.open} editing={form.editing} onClose={() => setForm({ open: false, editing: null })} />
      <PersonDetailDrawer id={detailId} onClose={() => setDetailId(null)} />
    </>
  );
}

function PersonDetailDrawer({ id, onClose }: { id: number | null; onClose: () => void }) {
  const query = useFetchPerson(id);
  const gender = useLookup("gender", id !== null);
  const p = query.data;
  return (
    <Drawer placement="left" title="جزئیات شخص" open={id !== null} onClose={onClose} width={560} destroyOnClose>
      <QueryState isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>
        {p && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="کد ملی">{textOrDash(p.nationalCode)}</Descriptions.Item>
            <Descriptions.Item label="نام">{`${p.firstName} ${p.lastName}`}</Descriptions.Item>
            <Descriptions.Item label="نام پدر">{textOrDash(p.fatherName)}</Descriptions.Item>
            <Descriptions.Item label="نام مادر">{textOrDash(p.motherName)}</Descriptions.Item>
            <Descriptions.Item label="جنسیت">{lookupTitle(gender.data, p.genderId)}</Descriptions.Item>
            <Descriptions.Item label="تاریخ تولد">{formatDateFa(p.birthDate)}</Descriptions.Item>
            <Descriptions.Item label="موبایل">{textOrDash(p.mobile)}</Descriptions.Item>
            <Descriptions.Item label="تلفن ثابت">{textOrDash(p.homeNumber)}</Descriptions.Item>
            <Descriptions.Item label="علایق">{textOrDash(p.interest)}</Descriptions.Item>
            <Descriptions.Item label="آرزو">{textOrDash(p.wish)}</Descriptions.Item>
            <Descriptions.Item label="نوع بیماری">{textOrDash(p.sicknessType)}</Descriptions.Item>
            <Descriptions.Item label="درآمد">{textOrDash(p.income)}</Descriptions.Item>
          </Descriptions>
        )}
      </QueryState>
    </Drawer>
  );
}
