import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  App,
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  Row,
  Space,
  Switch,
  Tag,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useCreateCase, useFetchCase, useUpdateCase } from "@/api/case/_hook";
import { useFetchPersons } from "@/api/person/_hook";
import { useFetchRequests } from "@/api/request/_hook";
import {
  CityField,
  Field,
  LookupField,
  SwitchField,
} from "@/components/common/fields";
import { FormField } from "@/components/common/FormField";
import { QueryState } from "@/components/common/QueryState";
import { LookupSelect } from "@/components/common/inputs";
import { applyServerErrors } from "@/lib/forms";
import { errorMessage } from "@/lib/errors";
import type { ICase, ICaseMember } from "@/interface/case/ICase";
import type { ICaseWritePayload, SaveCaseResult } from "@/api/case/_request";
import { CASE_FIELDS, caseSchema, type CaseFormValues } from "./schema";

interface Props {
  open: boolean;
  /** شناسه پرونده برای ویرایش؛ null یعنی ایجاد */
  caseId: number | null;
  /** درخواست پیش‌فرض هنگام ایجاد از صفحه جزئیات درخواست */
  initialRequestId?: number | null;
  onClose: () => void;
}

const col = { xs: 24, md: 12 } as const;

const blank = (requestId?: number | null): Partial<CaseFormValues> => ({
  requestId: requestId ?? undefined,
  addressDesc: "",
  postalCode: "",
  phoneNumber: "",
  homeNumber: "",
  accountName: "",
  bankBranchName: "",
  bankBranchCode: "",
  accountNumber: "",
  iban: "",
  cardNumber: "",
  activeStatus: true,
  members: [],
});

function fromCase(c: ICase): Partial<CaseFormValues> {
  return {
    requestId: c.requestId,
    caseTypeId: c.caseTypeId,
    privatenessStatusId: c.privatenessStatusId,
    houseHeadStatusId: c.houseHeadStatusId,
    referrerId: c.referrerId,
    provinceId: c.provinceId,
    cityId: c.cityId,
    addressDesc: c.addressDesc,
    postalCode: c.postalCode ?? "",
    areaId: c.areaId,
    latitude: c.latitude,
    longitude: c.longitude,
    phoneNumber: c.phoneNumber,
    homeNumber: c.homeNumber ?? "",
    accountName: c.accountName ?? "",
    bankId: c.bankId,
    bankBranchName: c.bankBranchName ?? "",
    bankBranchCode: c.bankBranchCode ?? "",
    accountNumber: c.accountNumber ?? "",
    iban: c.iban ?? "",
    cardNumber: c.cardNumber ?? "",
    caseStageId: c.caseStageId,
    activeStatus: c.activeStatus === 1,
    members: (c.caseMembers ?? []).map((m) => ({
      personId: m.personId,
      relationId: m.relationId ?? undefined,
      isDependent: m.isDependent,
      existing: true,
    })),
  };
}

export function CaseFormDrawer({
  open,
  caseId,
  initialRequestId,
  onClose,
}: Props) {
  const { message, modal } = App.useApp();
  const isEdit = caseId !== null;
  const detail = useFetchCase(caseId);
  const requests = useFetchRequests();
  const persons = useFetchPersons();
  const create = useCreateCase();
  const update = useUpdateCase();
  const busy = create.isPending || update.isPending;

  const { control, handleSubmit, setError, setValue, watch, reset } =
    useForm<CaseFormValues>({
      resolver: zodResolver(caseSchema),
      defaultValues: blank(initialRequestId),
    });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "members",
  });
  const provinceId = watch("provinceId");

  useEffect(() => {
    if (!open) return;
    if (!isEdit) reset(blank(initialRequestId));
  }, [open, isEdit, initialRequestId, reset]);

  useEffect(() => {
    if (open && isEdit && detail.data) reset(fromCase(detail.data));
  }, [open, isEdit, detail.data, reset]);

  const reportResult = (r: SaveCaseResult) => {
    if (r.failed.length > 0) {
      modal.warning({
        title: "پرونده ذخیره شد، اما ثبت برخی اشخاص ناموفق بود",
        content: (
          <div>
            {r.caseNumber && <p>{`شماره پرونده: ${r.caseNumber}`}</p>}
            <ul>
              {r.failed.map((f) => (
                <li
                  key={f.member.personId}
                >{`شخص ${f.member.personId}: ${f.message}`}</li>
              ))}
            </ul>
          </div>
        ),
      });
    } else if (!isEdit && r.caseNumber) {
      modal.success({
        title: "پرونده با موفقیت ایجاد شد",
        content: (
          <span>
            شماره پرونده:{" "}
            <strong style={{ fontSize: 18 }}>{r.caseNumber}</strong>
          </span>
        ),
        okText: "متوجه شدم",
      });
    } else if (!isEdit) {
      message.success(
        "پرونده ایجاد شد؛ شماره پرونده را در فهرست پرونده‌ها ببینید.",
      );
    } else {
      message.success("پرونده با موفقیت ویرایش شد.");
    }
    onClose();
  };

  const onSubmit = handleSubmit((v) => {
    if (busy) return;
    const { members, activeStatus, latitude, longitude, ...rest } = v;
    const payload: ICaseWritePayload = {
      ...rest,
      postalCode: rest.postalCode ?? "",
      homeNumber: rest.homeNumber ?? "",
      accountName: rest.accountName ?? "",
      bankBranchName: rest.bankBranchName ?? "",
      bankBranchCode: rest.bankBranchCode ?? "",
      accountNumber: rest.accountNumber ?? "",
      iban: (rest.iban ?? "").toUpperCase(),
      cardNumber: rest.cardNumber ?? "",
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      activeStatus: activeStatus ? 1 : 0,
    };
    const toMember = (m: (typeof members)[number]): ICaseMember => ({
      personId: m.personId,
      relationId: m.relationId ?? undefined,
      isDependent: m.isDependent,
      isHead: false,
    });
    const handlers = {
      onSuccess: reportResult,
      onError: (e: unknown) => {
        if (!applyServerErrors(e, setError, CASE_FIELDS))
          message.error(errorMessage(e));
      },
    };
    if (isEdit) {
      update.mutate(
        {
          payload: {
            ...payload,
            id: caseId,
            caseNumber: detail.data?.caseNumber,
          },
          newMembers: members.filter((m) => !m.existing).map(toMember),
        },
        handlers,
      );
    } else {
      create.mutate({ payload, members: members.map(toMember) }, handlers);
    }
  });

  return (
    <Drawer
      placement="left"
      title={isEdit ? "ویرایش پرونده" : "ایجاد پرونده"}
      open={open}
      onClose={onClose}
      width={960}
      destroyOnClose
      maskClosable={!busy}
      footer={
        <Space>
          <Button
            type="primary"
            loading={busy}
            onClick={onSubmit}
            disabled={isEdit && !detail.data}
          >
            ذخیره
          </Button>
          <Button onClick={onClose} disabled={busy}>
            انصراف
          </Button>
        </Space>
      }
    >
      <QueryState
        isLoading={isEdit && detail.isLoading}
        error={isEdit ? detail.error : null}
        onRetry={() => detail.refetch()}
      >
        <Form layout="vertical" component={false}>
          <Divider orientation="right">اطلاعات اصلی</Divider>
          <Row gutter={16}>
            {isEdit && (
              <Col {...col}>
                <Form.Item label="شماره پرونده">
                  <Input readOnly value={detail.data?.caseNumber ?? ""} />
                </Form.Item>
              </Col>
            )}
            <Col {...col}>
              <FormField
                control={control}
                name="requestId"
                label="درخواست مرتبط"
                required
                render={(f) => (
                  <LookupSelect
                    disabled={isEdit}
                    query={{
                      data: (requests.data ?? []).map((r) => ({
                        id: r.id,
                        title: `${r.id} - ${r.fullName || `${r.clientFirstName} ${r.clientLastName}`}${r.requestStatusTitle ? ` (${r.requestStatusTitle})` : ""}`,
                      })),
                      isLoading: requests.isLoading,
                      isError: requests.isError,
                      error: requests.error,
                    }}
                    value={(f.value as number | undefined) ?? undefined}
                    onChange={f.onChange}
                    onBlur={f.onBlur}
                  />
                )}
              />
            </Col>
            <Col {...col}>
              <LookupField
                control={control}
                name="caseTypeId"
                label="نوع پرونده"
                lookup="caseType"
                required
              />
            </Col>
            <Col {...col}>
              <LookupField
                control={control}
                name="privatenessStatusId"
                label="وضعیت محرمانگی"
                lookup="privatenessStatus"
                required
              />
            </Col>
            <Col {...col}>
              <LookupField
                control={control}
                name="houseHeadStatusId"
                label="وضعیت سرپرست خانوار"
                lookup="houseHeadStatus"
                required
              />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="referrerId"
                kind="number"
                label="شناسه معرف"
                required
                help="فهرست معرف‌ها در API تعریف نشده است."
              />
            </Col>
          </Row>

          <Divider orientation="right">محل سکونت</Divider>
          <Row gutter={16}>
            <Col {...col}>
              <LookupField
                control={control}
                name="provinceId"
                label="استان"
                lookup="province"
                required
                onValueChange={() =>
                  setValue("cityId", undefined as unknown as number)
                }
              />
            </Col>
            <Col {...col}>
              <CityField
                control={control}
                name="cityId"
                provinceId={provinceId}
                required
              />
            </Col>
            <Col {...col}>
              <LookupField
                control={control}
                name="areaId"
                label="منطقه"
                lookup="area"
                required
              />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="postalCode"
                kind="digits"
                label="کد پستی"
                maxLength={10}
              />
            </Col>
            <Col span={24}>
              <Field
                control={control}
                name="addressDesc"
                kind="textarea"
                label="توضیحات نشانی"
                required
                maxLength={1000}
              />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="latitude"
                kind="number"
                label="عرض جغرافیایی"
              />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="longitude"
                kind="number"
                label="طول جغرافیایی"
              />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="phoneNumber"
                kind="digits"
                label="شماره تماس"
                required
                maxLength={11}
              />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="homeNumber"
                kind="digits"
                label="تلفن ثابت"
                maxLength={11}
              />
            </Col>
          </Row>

          <Divider orientation="right">اطلاعات بانکی</Divider>
          <Row gutter={16}>
            <Col {...col}>
              <Field
                control={control}
                name="accountName"
                label="نام صاحب حساب"
              />
            </Col>
            <Col {...col}>
              <LookupField
                control={control}
                name="bankId"
                label="بانک"
                lookup="bank"
                required
              />
            </Col>
            <Col {...col}>
              <Field control={control} name="bankBranchName" label="نام شعبه" />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="bankBranchCode"
                kind="digits"
                label="کد شعبه"
                maxLength={20}
              />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="accountNumber"
                kind="digits"
                label="شماره حساب"
                maxLength={30}
              />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="iban"
                label="شماره شبا"
                maxLength={26}
                placeholder="IR..."
              />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="cardNumber"
                kind="digits"
                label="شماره کارت"
                maxLength={16}
              />
            </Col>
          </Row>

          <Divider orientation="right">وضعیت پرونده</Divider>
          <Row gutter={16}>
            <Col {...col}>
              <Field
                control={control}
                name="caseStageId"
                kind="number"
                label="شناسه مرحله پرونده"
                required
                help="فهرست مراحل در API تعریف نشده است."
              />
            </Col>
            <Col {...col}>
              <SwitchField control={control} name="activeStatus" label="فعال" />
            </Col>
          </Row>

          <Divider orientation="right">اشخاص پرونده</Divider>
          {isEdit && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message="در API فقط ثبت رابطه جدید (CasePerson) وجود دارد؛ اعضای ثبت‌شده قبلی قابل ویرایش یا حذف نیستند و فقط اشخاص جدید اضافه می‌شوند."
            />
          )}
          {fields.map((field, index) => {
            const locked = !!field.existing;
            return (
              <Row key={field.id} gutter={12} align="top">
                <Col xs={24} md={9}>
                  <FormField
                    control={control}
                    name={`members.${index}.personId`}
                    label="شخص"
                    required
                    render={(f) => (
                      <LookupSelect
                        disabled={locked}
                        query={{
                          data: (persons.data ?? [])
                            .filter((p) => p.id !== undefined)
                            .map((p) => ({
                              id: p.id as number,
                              title: `${p.firstName} ${p.lastName} - ${p.nationalCode}`,
                            })),
                          isLoading: persons.isLoading,
                          isError: persons.isError,
                          error: persons.error,
                        }}
                        value={(f.value as number | undefined) ?? undefined}
                        onChange={f.onChange}
                        onBlur={f.onBlur}
                      />
                    )}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Field
                    control={control}
                    name={`members.${index}.relationId`}
                    kind="number"
                    label="نسبت (شناسه)"
                    required={!locked}
                    disabled={locked}
                  />
                </Col>
                <Col xs={12} md={5}>
                  <FormField
                    control={control}
                    name={`members.${index}.isDependent`}
                    label="تحت تکفل"
                    render={(f) => (
                      <Switch
                        disabled={locked}
                        checked={!!f.value}
                        onChange={f.onChange}
                        checkedChildren="بله"
                        unCheckedChildren="خیر"
                      />
                    )}
                  />
                </Col>
                <Col xs={24} md={4} style={{ paddingTop: 30 }}>
                  {locked ? (
                    <Tag>ثبت‌شده</Tag>
                  ) : (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      aria-label="حذف ردیف"
                      onClick={() => remove(index)}
                    />
                  )}
                </Col>
              </Row>
            );
          })}
          <Button
            icon={<PlusOutlined />}
            onClick={() =>
              append({
                personId: undefined as unknown as number,
                relationId: undefined as unknown as number,
                isDependent: false,
              })
            }
          >
            افزودن شخص
          </Button>
          <Alert
            type="warning"
            showIcon
            style={{ marginTop: 12 }}
            message="نسبت هر شخص با پرونده (relationId) فعلاً به‌صورت شناسه وارد می‌شود، چون Endpoint فهرست نسبت‌ها در قرارداد API نیست."
          />
        </Form>
      </QueryState>
    </Drawer>
  );
}
