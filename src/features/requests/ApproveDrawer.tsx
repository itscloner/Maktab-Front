import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { App, Button, Drawer, Form, Space, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useApproveRequestQuery } from "@/api/request/_hook";
import { Field, LookupField } from "@/components/common/fields";
import { FormField } from "@/components/common/FormField";
import { errorMessage } from "@/lib/errors";
import type { IRequestList } from "@/interface/request/IRequest";
import { approveSchema, type ApproveFormValues } from "./schema";

interface Props {
  request: IRequestList | null;
  onClose: () => void;
}

const defaults = (r: IRequestList | null): Partial<ApproveFormValues> => ({
  requestStatusId: r?.requestStatusId,
  statusReason: "",
  approveDate: new Date().toISOString(),
  officerDescription: "",
  attachment: undefined,
});

export function ApproveDrawer({ request, onClose }: Props) {
  const { message } = App.useApp();
  const approve = useApproveRequestQuery();
  const { control, handleSubmit, reset } = useForm<ApproveFormValues>({
    resolver: zodResolver(approveSchema),
    defaultValues: defaults(request),
  });

  useEffect(() => {
    if (request) reset(defaults(request));
  }, [request, reset]);

  const onSubmit = handleSubmit((v) => {
    if (!request || approve.isPending) return;
    approve.mutate(
      {
        id: request.id,
        requestStatusId: v.requestStatusId,
        statusReason: v.statusReason,
        approveDate: v.approveDate,
        officerDescription: v.officerDescription || undefined,
        attachment: v.attachment ?? null,
      },
      {
        onSuccess: () => {
          message.success("وضعیت درخواست با موفقیت ثبت شد.");
          onClose();
        },
        onError: (e) => message.error(errorMessage(e)),
      },
    );
  });

  return (
    <Drawer placement="left"
      title={request ? `بررسی و تغییر وضعیت درخواست ${request.id}` : "تغییر وضعیت"}
      open={!!request}
      onClose={onClose}
      width={480}
      destroyOnClose
      maskClosable={!approve.isPending}
      footer={
        <Space>
          <Button type="primary" loading={approve.isPending} onClick={onSubmit}>ثبت</Button>
          <Button onClick={onClose} disabled={approve.isPending}>انصراف</Button>
        </Space>
      }
    >
      <Form layout="vertical" component={false}>
        <LookupField control={control} name="requestStatusId" label="وضعیت جدید" lookup="requestStatus" required />
        <Field control={control} name="statusReason" kind="textarea" label="دلیل تغییر وضعیت" required maxLength={1000} />
        <Field control={control} name="approveDate" kind="datetime" label="تاریخ تأیید" required />
        <Field control={control} name="officerDescription" kind="textarea" label="توضیحات کارشناس" maxLength={2000} />
        <FormField control={control} name="attachment" label="فایل ضمیمه"
          render={(f) => {
            const file = f.value as File | undefined;
            return (
              <Upload
                maxCount={1}
                beforeUpload={(picked) => {
                  f.onChange(picked);
                  return false; // ارسال همراه با فرم انجام می‌شود، نه بارگذاری خودکار
                }}
                onRemove={() => f.onChange(undefined)}
                fileList={file ? [{ uid: "attachment", name: file.name, status: "done" }] : []}
              >
                <Button icon={<UploadOutlined />}>انتخاب فایل</Button>
              </Upload>
            );
          }} />
      </Form>
    </Drawer>
  );
}
