import { InboxOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, Descriptions, Drawer, Input, InputNumber, Row, Col, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, EditOutlined, EyeOutlined, FolderAddOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { JalaliDatePicker } from "@/components/common/JalaliDatePicker";
import { useFetchRequest, useFetchRequests } from "@/api/request/_hook";
import { useLookup } from "@/api/base/_hooks";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { StatusTag } from "@/components/common/StatusTag";
import { toOptions, formatDateFa, formatDateTimeFa, textOrDash } from "@/utils/format";
import type { IFilterRequest, IRequestList } from "@/interface/request/IRequest";
import { ApproveDrawer } from "./ApproveDrawer";
import { RequestFormDrawer } from "./RequestFormDrawer";

interface Draft {
  requestId: number | null;
  clientFirstName: string;
  clientLastName: string;
  requestTypeIds: number[];
  requestStatusId: number | null;
  fromDate?: string;
  toDate?: string;
}

const emptyDraft: Draft = { requestId: null, clientFirstName: "", clientLastName: "", requestTypeIds: [], requestStatusId: null };

const startOfDay = (iso: string) => { const d = new Date(iso); d.setHours(0, 0, 0, 0); return d.toISOString(); };
const endOfDay = (iso: string) => { const d = new Date(iso); d.setHours(23, 59, 59, 999); return d.toISOString(); };

function toFilter(d: Draft): Partial<IFilterRequest> {
  return {
    requestId: d.requestId,
    clientFirstName: d.clientFirstName.trim(),
    clientLastName: d.clientLastName.trim(),
    requestTypeIds: d.requestTypeIds,
    requestStatusId: d.requestStatusId,
    // تاریخ شمسی انتخاب‌شده به ابتدا/انتهای همان روز میلادی تبدیل و ISO ارسال می‌شود
    fromDate: d.fromDate ? startOfDay(d.fromDate) : "",
    toDate: d.toDate ? endOfDay(d.toDate) : "",
  };
}

export default function RequestsPage() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [applied, setApplied] = useState<Partial<IFilterRequest>>({});
  const requests = useFetchRequests(applied);
  const types = useLookup("requestType");
  const statuses = useLookup("requestStatus");
  const [form, setForm] = useState<{ open: boolean; editing: IRequestList | null }>({ open: false, editing: null });
  const [approving, setApproving] = useState<IRequestList | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [sp, setSp] = useSearchParams();
  useEffect(() => {
    if (sp.get("new") === "1") {
      setForm({ open: true, editing: null });
      setSp({}, { replace: true });
    }
  }, [sp, setSp]);

  const columns: ColumnsType<IRequestList> = [
    { title: "شناسه", dataIndex: "id", width: 80 },
    { title: "متقاضی", render: (_, r) => r.fullName || `${r.clientFirstName} ${r.clientLastName}` },
    { title: "تاریخ درخواست", dataIndex: "requestDate", render: formatDateFa },
    { title: "نوع درخواست", render: (_, r) => textOrDash(r.requestTypeTitle) },
    { title: "وضعیت", render: (_, r) => <StatusTag id={r.requestStatusId} title={r.requestStatusTitle} /> },
    { title: "موبایل", dataIndex: "mobileNumber", render: textOrDash },
    {
      title: "عملیات",
      width: 170,
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} aria-label="جزئیات" onClick={() => setDetailId(r.id)} />
          <Button size="small" icon={<EditOutlined />} aria-label="ویرایش" onClick={() => setForm({ open: true, editing: r })} />
          <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => setApproving(r)}>بررسی</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader icon={<InboxOutlined />} title="مدیریت درخواست‌ها" description="ثبت، بررسی و تعیین وضعیت درخواست‌های مددجویان"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setForm({ open: true, editing: null })}>درخواست جدید</Button>} />
      <Card size="small" style={{ marginBottom: 12 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={6}><InputNumber style={{ width: "100%" }} placeholder="شناسه درخواست" value={draft.requestId}
            onChange={(v) => setDraft({ ...draft, requestId: v })} /></Col>
          <Col xs={24} md={6}><Input placeholder="نام متقاضی" value={draft.clientFirstName}
            onChange={(e) => setDraft({ ...draft, clientFirstName: e.target.value })} /></Col>
          <Col xs={24} md={6}><Input placeholder="نام خانوادگی متقاضی" value={draft.clientLastName}
            onChange={(e) => setDraft({ ...draft, clientLastName: e.target.value })} /></Col>
          <Col xs={24} md={6}>
            <Select<number> allowClear placeholder="وضعیت" style={{ width: "100%" }} loading={statuses.isLoading}
              options={toOptions(statuses.data)} value={draft.requestStatusId ?? undefined}
              onChange={(v) => setDraft({ ...draft, requestStatusId: v ?? null })} />
          </Col>
          <Col xs={24} md={8}>
            <Select<number[]> mode="multiple" allowClear placeholder="نوع درخواست" style={{ width: "100%" }} loading={types.isLoading}
              options={toOptions(types.data)} value={draft.requestTypeIds} optionFilterProp="label"
              onChange={(v) => setDraft({ ...draft, requestTypeIds: v })} />
          </Col>
          <Col xs={12} md={5}>
            <JalaliDatePicker placeholder="از تاریخ" value={draft.fromDate} onChange={(v) => setDraft({ ...draft, fromDate: v })} />
          </Col>
          <Col xs={12} md={5}>
            <JalaliDatePicker placeholder="تا تاریخ" value={draft.toDate} onChange={(v) => setDraft({ ...draft, toDate: v })} />
          </Col>
          <Col xs={24} md={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={() => setApplied(toFilter(draft))}>جست‌وجو</Button>
              <Button onClick={() => { setDraft(emptyDraft); setApplied({}); }}>پاک‌سازی</Button>
            </Space>
          </Col>
        </Row>
      </Card>
      <QueryState isLoading={requests.isLoading} error={requests.error} onRetry={() => requests.refetch()}>
        <Table<IRequestList> rowKey="id" columns={columns} dataSource={requests.data ?? []} scroll={{ x: true }}
          locale={{ emptyText: "درخواستی یافت نشد." }} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </QueryState>
      <RequestFormDrawer open={form.open} editing={form.editing} onClose={() => setForm({ open: false, editing: null })} />
      <ApproveDrawer request={approving} onClose={() => setApproving(null)} />
      <RequestDetailDrawer id={detailId} onClose={() => setDetailId(null)} />
    </>
  );
}

function RequestDetailDrawer({ id, onClose }: { id: number | null; onClose: () => void }) {
  const navigate = useNavigate();
  const query = useFetchRequest(id);
  const r = query.data;
  const isUrl = !!r?.attachment && /^https?:\/\//i.test(r.attachment);
  return (
    <Drawer placement="left" title="جزئیات درخواست" open={id !== null} onClose={onClose} width={560} destroyOnClose
      footer={r && (
        <Button icon={<FolderAddOutlined />} onClick={() => navigate("/cases", { state: { createFromRequestId: r.id } })}>
          ایجاد پرونده از این درخواست
        </Button>
      )}>
      <QueryState isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>
        {r && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="شناسه">{r.id}</Descriptions.Item>
            <Descriptions.Item label="متقاضی">{r.fullName || `${r.clientFirstName} ${r.clientLastName}`}</Descriptions.Item>
            <Descriptions.Item label="تاریخ درخواست">{formatDateTimeFa(r.requestDate)}</Descriptions.Item>
            <Descriptions.Item label="تاریخ ثبت">{formatDateTimeFa(r.createdDate)}</Descriptions.Item>
            <Descriptions.Item label="نوع درخواست">{textOrDash(r.requestTypeTitle)}</Descriptions.Item>
            <Descriptions.Item label="وضعیت"><StatusTag id={r.requestStatusId} title={r.requestStatusTitle} /></Descriptions.Item>
            <Descriptions.Item label="توضیحات">{textOrDash(r.requestDescription)}</Descriptions.Item>
            <Descriptions.Item label="سرپرست خانوار">{textOrDash(r.houseHeadStatusTitle)}</Descriptions.Item>
            <Descriptions.Item label="جنسیت">{textOrDash(r.gender)}</Descriptions.Item>
            <Descriptions.Item label="معرف">{textOrDash(r.refererName)}</Descriptions.Item>
            <Descriptions.Item label="ملیت / مذهب">{`${textOrDash(r.nationaltyTitle)} / ${textOrDash(r.religonTitle)}`}</Descriptions.Item>
            <Descriptions.Item label="محل">{`${textOrDash(r.provinceTitle)}، ${textOrDash(r.cityTitle)}، ${textOrDash(r.areaTitle)}`}</Descriptions.Item>
            <Descriptions.Item label="نشانی">{textOrDash(r.address)}</Descriptions.Item>
            <Descriptions.Item label="موبایل">{textOrDash(r.mobileNumber)}</Descriptions.Item>
            <Descriptions.Item label="تلفن ثابت">{textOrDash(r.homeNumber)}</Descriptions.Item>
            <Descriptions.Item label="دلیل وضعیت">{textOrDash(r.statusReason)}</Descriptions.Item>
            <Descriptions.Item label="تاریخ تأیید">{formatDateTimeFa(r.approveDate)}</Descriptions.Item>
            <Descriptions.Item label="توضیحات کارشناس">{textOrDash(r.officerDescription)}</Descriptions.Item>
            <Descriptions.Item label="ضمیمه">
              {isUrl ? <a href={r.attachment ?? undefined} target="_blank" rel="noreferrer">مشاهده فایل</a> : textOrDash(r.attachment)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </QueryState>
    </Drawer>
  );
}
