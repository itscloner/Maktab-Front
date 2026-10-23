import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, App, Button, Col, Drawer, Form, Row, Space, Spin } from "antd";
import {
  useCreateRequestQuery,
  useFetchRequest,
  useUpdateRequestQuery,
} from "@/api/request/_hook";
import { useLookup } from "@/api/base/_hooks";
import { CityField, Field, LookupField } from "@/components/common/fields";
import { applyServerErrors } from "@/lib/forms";
import { errorMessage } from "@/lib/errors";
import { lookupLabel } from "@/utils/format";
import type { IRequest, IRequestList } from "@/interface/request/IRequest";
import {
  REQUEST_FIELDS,
  requestSchema,
  type RequestFormValues,
} from "./schema";

interface Props {
  open: boolean;
  editing: IRequestList | null;
  onClose: () => void;
}

const col = { xs: 24, md: 12 } as const;

function toDefaults(r: IRequestList | null): Partial<RequestFormValues> {
  if (!r)
    return {
      requestDate: new Date().toISOString(),
      requestDescription: "",
      clientFirstName: "",
      clientLastName: "",
      address: "",
      mobileNumber: "",
      homeNumber: "",
    };
  return {
    requestDate: r.requestDate,
    requestDescription: r.requestDescription,
    requestTypeId: r.requestTypeId,
    clientFirstName: r.clientFirstName,
    clientLastName: r.clientLastName,
    houseHeadStatusId: r.houseHeadStatusId,
    genderId: r.genderId ?? undefined,
    refererId: r.refererId,
    nationaltyId: r.nationaltyId,
    provinceId: r.provinceId,
    cityId: r.cityId,
    address: r.address,
    mobileNumber: r.mobileNumber,
    homeNumber: r.homeNumber ?? "",
    areaId: r.areaId,
    religonId: r.religonId,
    requestStatusId: r.requestStatusId,
  };
}

export function RequestFormDrawer({ open, editing, onClose }: Props) {
  const { message } = App.useApp();
  const create = useCreateRequestQuery();
  const update = useUpdateRequestQuery();
  const gender = useLookup("gender");
  const busy = create.isPending || update.isPending;

  const { control, handleSubmit, setError, setValue, watch, reset } =
    useForm<RequestFormValues>({
      resolver: zodResolver(requestSchema),
      defaultValues: toDefaults(editing),
    });

  // رکورد کامل از سرور خوانده می‌شود تا تمام اطلاعات ثبت‌شده پیش‌فرض فرم باشد
  const detail = useFetchRequest(open && editing ? editing.id : null);
  const source = detail.data ?? editing;

  useEffect(() => {
    if (open) reset(toDefaults(source));
  }, [open, source, reset]);

  // اگر پاسخ فهرست فقط متن جنسیت دارد، شناسه از روی فهرست Gender پیدا می‌شود
  const genderItems = gender.data;
  useEffect(() => {
    if (!open || !source || source.genderId || !genderItems) return;
    const match = genderItems.find((g) => lookupLabel(g) === source.gender);
    if (match) setValue("genderId", match.id);
  }, [open, source, genderItems, setValue]);

  const provinceId = watch("provinceId");

  const onSubmit = handleSubmit((values) => {
    if (busy) return;
    const payload: IRequest = {
      ...values,
      homeNumber: values.homeNumber ?? "",
    };
    const handlers = {
      onSuccess: () => {
        message.success(
          editing ? "درخواست ویرایش شد." : "درخواست با موفقیت ثبت شد.",
        );
        onClose();
      },
      onError: (e: unknown) => {
        if (!applyServerErrors(e, setError, REQUEST_FIELDS))
          message.error(errorMessage(e));
      },
    };
    if (editing) update.mutate({ ...payload, id: editing.id }, handlers);
    else create.mutate(payload, handlers);
  });

  return (
    <Drawer
      placement="left"
      title={editing ? "ویرایش درخواست" : "ثبت درخواست جدید"}
      open={open}
      onClose={onClose}
      width={860}
      destroyOnClose
      maskClosable={!busy}
      footer={
        <Space>
          <Button type="primary" loading={busy} onClick={onSubmit}>
            ذخیره
          </Button>
          <Button onClick={onClose} disabled={busy}>
            انصراف
          </Button>
        </Space>
      }
    >
      {editing && detail.isError && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message={`دریافت اطلاعات کامل درخواست ناموفق بود؛ داده‌های فهرست نمایش داده می‌شود. ${errorMessage(detail.error)}`}
        />
      )}
      <Spin spinning={!!editing && detail.isLoading}>
        <Form layout="vertical" component={false}>
          <Row gutter={16}>
            <Col {...col}>
              <Field
                control={control}
                name="requestDate"
                kind="datetime"
                label="تاریخ درخواست"
                required
              />
            </Col>
            <Col {...col}>
              <LookupField
                control={control}
                name="requestTypeId"
                label="نوع درخواست"
                lookup="requestType"
                required
              />
            </Col>
            <Col span={24}>
              <Field
                control={control}
                name="requestDescription"
                kind="textarea"
                label="توضیحات درخواست"
                required
                maxLength={2000}
              />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="clientFirstName"
                label="نام متقاضی"
                required
              />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="clientLastName"
                label="نام خانوادگی متقاضی"
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
              <LookupField
                control={control}
                name="genderId"
                label="جنسیت"
                lookup="gender"
                required
              />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="refererId"
                kind="number"
                label="شناسه معرف"
                required
                help="فهرست معرف‌ها در API تعریف نشده است."
              />
            </Col>
            <Col {...col}>
              <LookupField
                control={control}
                name="nationaltyId"
                label="ملیت"
                lookup="nationality"
                required
              />
            </Col>
            <Col {...col}>
              <LookupField
                control={control}
                name="religonId"
                label="مذهب"
                lookup="religon"
                required
              />
            </Col>
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
            <Col span={24}>
              <Field
                control={control}
                name="address"
                kind="textarea"
                label="نشانی"
                required
                maxLength={1000}
              />
            </Col>
            <Col {...col}>
              <Field
                control={control}
                name="mobileNumber"
                kind="digits"
                label="شماره موبایل"
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
            <Col {...col}>
              <LookupField
                control={control}
                name="requestStatusId"
                label="وضعیت درخواست"
                lookup="requestStatus"
                required
              />
            </Col>
          </Row>
        </Form>
      </Spin>
    </Drawer>
  );
}
