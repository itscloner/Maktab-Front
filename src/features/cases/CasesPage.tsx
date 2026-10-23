import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FolderOpenOutlined } from "@ant-design/icons";
import { App, Button, Card, Col, Descriptions, Drawer, Input, Popconfirm, Row, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useDeleteCase, useFetchCase, useFetchCases } from "@/api/case/_hook";
import { useLookup } from "@/api/base/_hooks";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { errorMessage } from "@/lib/errors";
import { formatDateFa, lookupTitle, textOrDash, toOptions } from "@/utils/format";
import type { ICase, ICaseFilter } from "@/interface/case/ICase";
import { CaseFormDrawer } from "./CaseFormDrawer";

export default function CasesPage() {
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ICaseFilter>({});
  const [applied, setApplied] = useState<ICaseFilter>({});
  const cases = useFetchCases(applied);
  const del = useDeleteCase();
  const types = useLookup("caseType");
  const privateness = useLookup("privatenessStatus");
  const [form, setForm] = useState<{ open: boolean; caseId: number | null; requestId: number | null }>({ open: false, caseId: null, requestId: null });
  const [detailId, setDetailId] = useState<number | null>(null);

  const [sp, setSp] = useSearchParams();
  useEffect(() => {
    if (sp.get("new") === "1") {
      setForm({ open: true, caseId: null, requestId: null });
      setSp({}, { replace: true });
    }
  }, [sp, setSp]);

  // ایجاد پرونده از صفحه جزئیات درخواست
  useEffect(() => {
    const id = (location.state as { createFromRequestId?: number } | null)?.createFromRequestId;
    if (id) {
      setForm({ open: true, caseId: null, requestId: id });
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const columns: ColumnsType<ICase> = [
    { title: "شماره پرونده", dataIndex: "caseNumber" },
    { title: "درخواست", dataIndex: "requestId" },
    { title: "نوع پرونده", render: (_, c) => lookupTitle(types.data, c.caseTypeId) },
    { title: "محرمانگی", render: (_, c) => lookupTitle(privateness.data, c.privatenessStatusId) },
    { title: "مرحله", dataIndex: "caseStageId" },
    { title: "وضعیت", render: (_, c) => (c.activeStatus === 1 ? <Tag color="green">فعال</Tag> : <Tag>غیرفعال</Tag>) },
    { title: "تاریخ ایجاد", dataIndex: "createdDate", render: formatDateFa },
    {
      title: "عملیات",
      width: 150,
      render: (_, c) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} aria-label="جزئیات" onClick={() => setDetailId(c.id ?? null)} />
          <Button size="small" icon={<EditOutlined />} aria-label="ویرایش" onClick={() => setForm({ open: true, caseId: c.id ?? null, requestId: null })} />
          <Popconfirm title="این پرونده حذف شود؟" okText="حذف" cancelText="انصراف" okButtonProps={{ danger: true }}
            onConfirm={() => c.id !== undefined && del.mutate(c.id, {
              onSuccess: () => message.success("پرونده حذف شد."),
              onError: (e) => message.error(errorMessage(e)),
            })}>
            <Button size="small" danger icon={<DeleteOutlined />} aria-label="حذف" loading={del.isPending && del.variables === c.id} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader icon={<FolderOpenOutlined />} title="مدیریت پرونده‌ها" description="پرونده‌های مددجویان و اشخاص عضو هر پرونده"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setForm({ open: true, caseId: null, requestId: null })}>پرونده جدید</Button>} />
      <Card size="small" style={{ marginBottom: 12 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={6}><Input placeholder="شماره پرونده" value={draft.caseNumber ?? ""} onChange={(e) => setDraft({ ...draft, caseNumber: e.target.value })} /></Col>
          <Col xs={24} md={6}><Input placeholder="شناسه درخواست" value={draft.requestId ?? ""} onChange={(e) => setDraft({ ...draft, requestId: e.target.value })} /></Col>
          <Col xs={24} md={6}><Input placeholder="کد ملی" value={draft.nationalCode ?? ""} onChange={(e) => setDraft({ ...draft, nationalCode: e.target.value })} /></Col>
          <Col xs={24} md={6}><Input placeholder="نام" value={draft.firstName ?? ""} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} /></Col>
          <Col xs={24} md={6}><Input placeholder="نام خانوادگی" value={draft.lastName ?? ""} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} /></Col>
          <Col xs={24} md={6}>
            <Select<number> allowClear placeholder="نوع پرونده" style={{ width: "100%" }} options={toOptions(types.data)} loading={types.isLoading}
              value={typeof draft.caseTypeId === "number" ? draft.caseTypeId : undefined} onChange={(v) => setDraft({ ...draft, caseTypeId: v ?? "" })} />
          </Col>
          <Col xs={24} md={6}>
            <Select<number> allowClear placeholder="محرمانگی" style={{ width: "100%" }} options={toOptions(privateness.data)} loading={privateness.isLoading}
              value={typeof draft.privatenessStatusId === "number" ? draft.privatenessStatusId : undefined} onChange={(v) => setDraft({ ...draft, privatenessStatusId: v ?? "" })} />
          </Col>
          <Col xs={24} md={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={() => setApplied(draft)}>جست‌وجو</Button>
              <Button onClick={() => { setDraft({}); setApplied({}); }}>پاک‌سازی</Button>
            </Space>
          </Col>
        </Row>
      </Card>
      <QueryState isLoading={cases.isLoading} error={cases.error} onRetry={() => cases.refetch()}>
        <Table<ICase> rowKey="id" columns={columns} dataSource={cases.data ?? []} scroll={{ x: true }}
          locale={{ emptyText: "پرونده‌ای یافت نشد." }} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </QueryState>
      <CaseFormDrawer open={form.open} caseId={form.caseId} initialRequestId={form.requestId}
        onClose={() => setForm({ open: false, caseId: null, requestId: null })} />
      <CaseDetailDrawer id={detailId} onClose={() => setDetailId(null)} />
    </>
  );
}

function CaseDetailDrawer({ id, onClose }: { id: number | null; onClose: () => void }) {
  const query = useFetchCase(id);
  const types = useLookup("caseType", id !== null);
  const privateness = useLookup("privatenessStatus", id !== null);
  const banks = useLookup("bank", id !== null);
  const c = query.data;
  return (
    <Drawer placement="left" title="جزئیات پرونده" open={id !== null} onClose={onClose} width={620} destroyOnClose>
      <QueryState isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>
        {c && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="شماره پرونده">{c.caseNumber}</Descriptions.Item>
              <Descriptions.Item label="درخواست مرتبط">{textOrDash(c.requestNumber ?? c.requestId)}</Descriptions.Item>
              <Descriptions.Item label="نوع پرونده">{lookupTitle(types.data, c.caseTypeId)}</Descriptions.Item>
              <Descriptions.Item label="محرمانگی">{lookupTitle(privateness.data, c.privatenessStatusId)}</Descriptions.Item>
              <Descriptions.Item label="مرحله">{c.caseStageId}</Descriptions.Item>
              <Descriptions.Item label="وضعیت">{c.activeStatus === 1 ? "فعال" : "غیرفعال"}</Descriptions.Item>
              <Descriptions.Item label="نشانی">{textOrDash(c.addressDesc)}</Descriptions.Item>
              <Descriptions.Item label="کد پستی">{textOrDash(c.postalCode)}</Descriptions.Item>
              <Descriptions.Item label="شماره تماس">{textOrDash(c.phoneNumber)}</Descriptions.Item>
              <Descriptions.Item label="بانک">{lookupTitle(banks.data, c.bankId)}</Descriptions.Item>
              <Descriptions.Item label="صاحب حساب">{textOrDash(c.accountName)}</Descriptions.Item>
              <Descriptions.Item label="شماره شبا">{textOrDash(c.iban)}</Descriptions.Item>
              <Descriptions.Item label="شماره کارت">{textOrDash(c.cardNumber)}</Descriptions.Item>
            </Descriptions>
            <h4 style={{ marginTop: 16 }}>اشخاص پرونده</h4>
            <Table size="small" rowKey="personId" pagination={false} dataSource={c.caseMembers ?? []}
              locale={{ emptyText: "شخصی ثبت نشده است." }}
              columns={[
                { title: "شخص", render: (_, m) => (m.person ? `${m.person.firstName ?? ""} ${m.person.lastName ?? ""}`.trim() || m.personId : m.personId) },
                { title: "کد ملی", render: (_, m) => textOrDash(m.person?.nationalCode) },
                { title: "نسبت", render: (_, m) => textOrDash(m.relationship ?? m.relationId) },
                { title: "وابسته", render: (_, m) => (m.isDependent ? "بله" : "خیر") },
              ]} />
            {(c.attachments?.length ?? 0) > 0 && (
              <>
                <h4 style={{ marginTop: 16 }}>پیوست‌ها</h4>
                <ul>{c.attachments?.map((a, i) => <li key={a.id ?? i}>{`${a.attachmentType} - ${a.fileName}`}</li>)}</ul>
              </>
            )}
          </>
        )}
      </QueryState>
    </Drawer>
  );
}
