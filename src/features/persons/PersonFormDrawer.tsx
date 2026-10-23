import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, App, Button, Col, Divider, Drawer, Form, Row, Space, Spin } from "antd";
import { useCreatePersonQuery, useFetchPerson, useUpdatePersonQuery } from "@/api/person/_hook";
import { CityField, Field, LookupField } from "@/components/common/fields";
import { applyServerErrors } from "@/lib/forms";
import { errorMessage } from "@/lib/errors";
import { compact } from "@/utils/schema";
import type { IPerson, IPersonPayload } from "@/interface/person/IPerson";
import { personSchema, PERSON_FIELDS, type PersonFormValues } from "./schema";

interface Props {
  open: boolean;
  editing: IPerson | null;
  onClose: () => void;
}

const col = { xs: 24, md: 12 } as const;

function toDefaults(p: IPerson | null): Partial<PersonFormValues> {
  if (!p) return { nationalCode: "", firstName: "", lastName: "", mobile: "", homeNumber: "" };
  // مقادیر null سرور به undefined تبدیل می‌شوند تا با Schema فرم سازگار باشند
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) {
    if (k === "id" || !PERSON_FIELDS.includes(k)) continue;
    // null و شناسه‌ی ۰ (یعنی «انتخاب‌نشده») در فرم خالی نمایش داده می‌شوند
    out[k] = v === null || (k.endsWith("Id") && v === 0) ? undefined : v;
  }
  return out as Partial<PersonFormValues>;
}

export function PersonFormDrawer({ open, editing, onClose }: Props) {
  const { message } = App.useApp();
  const create = useCreatePersonQuery();
  const update = useUpdatePersonQuery();
  const busy = create.isPending || update.isPending;

  const { control, handleSubmit, setError, setValue, watch, reset } = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: toDefaults(editing),
  });

  // رکورد کامل از سرور خوانده می‌شود تا تمام اطلاعات ثبت‌شده پیش‌فرض فرم باشد
  const detail = useFetchPerson(open && editing?.id ? editing.id : null);

  useEffect(() => {
    if (open) reset(toDefaults(editing));
  }, [open, editing, reset]);

  useEffect(() => {
    if (open && detail.data) reset(toDefaults(detail.data));
  }, [open, detail.data, reset]);

  const provinceId = watch("birthProvinceId");

  const onSubmit = handleSubmit((values) => {
    if (busy) return;
    const payload: IPersonPayload = compact(values);
    const handlers = {
      onSuccess: () => {
        message.success(editing ? "اطلاعات شخص ویرایش شد." : "شخص با موفقیت ثبت شد.");
        onClose();
      },
      onError: (e: unknown) => {
        if (!applyServerErrors(e, setError, PERSON_FIELDS)) message.error(errorMessage(e));
      },
    };
    if (editing?.id) update.mutate({ ...payload, id: editing.id }, handlers);
    else create.mutate(payload, handlers);
  });

  return (
    <Drawer placement="left"
      title={editing ? "ویرایش شخص" : "ثبت شخص جدید"}
      open={open}
      onClose={onClose}
      width={860}
      destroyOnClose
      maskClosable={!busy}
      footer={
        <Space>
          <Button type="primary" loading={busy} onClick={onSubmit}>ذخیره</Button>
          <Button onClick={onClose} disabled={busy}>انصراف</Button>
        </Space>
      }
    >
      {editing && detail.isError && (
        <Alert type="warning" showIcon style={{ marginBottom: 12 }}
          message={`دریافت اطلاعات کامل شخص ناموفق بود؛ داده‌های فهرست نمایش داده می‌شود. ${errorMessage(detail.error)}`} />
      )}
      <Spin spinning={!!editing && detail.isLoading}>
      <Form layout="vertical" component={false}>
        <Divider orientation="right">مشخصات هویتی</Divider>
        <Row gutter={16}>
          <Col {...col}><Field control={control} name="nationalCode" kind="digits" label="کد ملی" required maxLength={10} /></Col>
          <Col {...col}><Field control={control} name="firstName" label="نام" required /></Col>
          <Col {...col}><Field control={control} name="lastName" label="نام خانوادگی" required /></Col>
          <Col {...col}><Field control={control} name="nickName" label="نام مستعار" /></Col>
          <Col {...col}><Field control={control} name="fatherName" label="نام پدر" /></Col>
          <Col {...col}><Field control={control} name="motherName" label="نام مادر" /></Col>
          <Col {...col}><LookupField control={control} name="genderId" label="جنسیت" lookup="gender" required /></Col>
          <Col {...col}><Field control={control} name="birthDate" kind="date" label="تاریخ تولد" /></Col>
          <Col {...col}><Field control={control} name="shenasnamehNumber" kind="digits" label="شماره شناسنامه" /></Col>
          <Col {...col}><Field control={control} name="shenasnamehSeries" label="سری شناسنامه" /></Col>
          <Col {...col}>
            <LookupField control={control} name="birthProvinceId" label="استان محل تولد" lookup="province"
              onValueChange={() => setValue("birthCityId", undefined)} />
          </Col>
          <Col {...col}><CityField control={control} name="birthCityId" label="شهر محل تولد" provinceId={provinceId} /></Col>
          <Col {...col}><LookupField control={control} name="maritalStatusId" label="وضعیت تأهل" lookup="maritalStatus" /></Col>
          <Col {...col}><LookupField control={control} name="nationalityId" label="ملیت" lookup="nationality" /></Col>
          <Col {...col}><LookupField control={control} name="religonId" label="مذهب" lookup="religon" /></Col>
          <Col {...col}><Field control={control} name="sadatStatusId" kind="number" label="شناسه وضعیت سادات"
            help="فهرست گزینه‌های این فیلد در API تعریف نشده است." /></Col>
        </Row>

        <Divider orientation="right">اطلاعات تماس</Divider>
        <Row gutter={16}>
          <Col {...col}><Field control={control} name="mobile" kind="digits" label="موبایل" maxLength={11} /></Col>
          <Col {...col}><Field control={control} name="homeNumber" kind="digits" label="تلفن ثابت" maxLength={11} /></Col>
        </Row>

        <Divider orientation="right">تحصیلات و شغل</Divider>
        <Row gutter={16}>
          <Col {...col}><LookupField control={control} name="educationStatusId" label="وضعیت تحصیل" lookup="educationalStatus" /></Col>
          <Col {...col}><LookupField control={control} name="educationLevelId" label="مقطع تحصیلی" lookup="educationLevel" /></Col>
          <Col {...col}><Field control={control} name="averageScore" label="معدل" maxLength={10} /></Col>
          <Col {...col}><LookupField control={control} name="skillId" label="مهارت" lookup="skill" /></Col>
          <Col {...col}><LookupField control={control} name="jobId" label="شغل" lookup="job" /></Col>
          <Col {...col}><LookupField control={control} name="employmentStatusId" label="وضعیت اشتغال" lookup="employmentStatus" /></Col>
          <Col {...col}><LookupField control={control} name="unemploymentReasonId" label="دلیل بیکاری" lookup="unemploymentReason" /></Col>
          <Col {...col}><Field control={control} name="income" kind="digits" label="درآمد" maxLength={30} /></Col>
          <Col span={24}><Field control={control} name="incomeDesc" kind="textarea" label="توضیحات درآمد" maxLength={500} /></Col>
          <Col span={24}><Field control={control} name="interest" kind="textarea" label="علایق" maxLength={500} /></Col>
          <Col span={24}><Field control={control} name="wish" kind="textarea" label="آرزو" maxLength={500} /></Col>
        </Row>

        <Divider orientation="right">وضعیت‌ها</Divider>
        <Row gutter={16}>
          <Col {...col}><LookupField control={control} name="dependancyStatusId" label="وضعیت تکفل" lookup="dependancyStatus" /></Col>
          <Col {...col}><LookupField control={control} name="orphanStatusId" label="وضعیت یتیمی" lookup="orphanStatus" /></Col>
          <Col {...col}><LookupField control={control} name="physicalStatusId" label="وضعیت جسمی" lookup="physicalStatus" /></Col>
          <Col {...col}><Field control={control} name="sicknessType" label="نوع بیماری" maxLength={200} /></Col>
        </Row>
      </Form>
      </Spin>
    </Drawer>
  );
}
