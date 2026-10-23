import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, App, Button, Drawer, Form, Space } from "antd";
import { useCreateUser, useFetchRoles, useUpdateUser } from "@/api/user/_hook";
import { isRolesApiConfigured } from "@/api/user/_request";
import { Field } from "@/components/common/fields";
import { FormField } from "@/components/common/FormField";
import { LookupSelect } from "@/components/common/inputs";
import { applyServerErrors } from "@/lib/forms";
import { errorMessage } from "@/lib/errors";
import type { IUser } from "@/interface/user/IUser";
import { makeUserSchema, USER_FIELDS, type UserFormValues } from "./schema";

interface Props {
  open: boolean;
  editing: IUser | null;
  onClose: () => void;
}

export function UserFormDrawer({ open, editing, onClose }: Props) {
  const { message } = App.useApp();
  const isEdit = !!editing;
  const schema = useMemo(() => makeUserSchema(isEdit), [isEdit]);
  const roles = useFetchRoles();
  const create = useCreateUser();
  const update = useUpdateUser();
  const busy = create.isPending || update.isPending;

  const { control, handleSubmit, setError, reset } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: editing?.firstName ?? "",
      lastName: editing?.lastName ?? "",
      userName: editing?.userName ?? "",
      password: "",
      mobile: editing?.mobile ?? "",
      roleId: editing?.roleId ?? undefined,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        firstName: editing?.firstName ?? "",
        lastName: editing?.lastName ?? "",
        userName: editing?.userName ?? "",
        password: "",
        mobile: editing?.mobile ?? "",
        roleId: editing?.roleId ?? undefined,
      });
    }
  }, [open, editing, reset]);

  const onSubmit = handleSubmit((v) => {
    if (busy) return;
    const payload = { ...v, password: v.password === "" ? undefined : v.password };
    const handlers = {
      onSuccess: () => {
        message.success(isEdit ? "کاربر با موفقیت ویرایش شد." : "کاربر با موفقیت ایجاد شد.");
        onClose();
      },
      onError: (e: unknown) => {
        const applied = applyServerErrors(e, setError, USER_FIELDS);
        if (!applied) message.error(errorMessage(e));
      },
    };
    if (editing) update.mutate({ id: editing.id, payload }, handlers);
    else create.mutate(payload, handlers);
  });

  return (
    <Drawer placement="left"
      title={isEdit ? "ویرایش کاربر" : "ایجاد کاربر"}
      open={open}
      onClose={onClose}
      width={460}
      destroyOnClose
      maskClosable={!busy}
      footer={
        <Space>
          <Button type="primary" loading={busy} onClick={onSubmit}>ذخیره</Button>
          <Button onClick={onClose} disabled={busy}>انصراف</Button>
        </Space>
      }
    >
      <Form layout="vertical" component={false}>
        <Field control={control} name="firstName" label="نام" required />
        <Field control={control} name="lastName" label="نام خانوادگی" required />
        <Field control={control} name="userName" label="نام کاربری" required />
        <Field control={control} name="password" kind="password" label="رمز عبور" required={!isEdit}
          help={isEdit ? "در صورت خالی‌گذاشتن، رمز عبور تغییر نمی‌کند." : undefined} />
        <Field control={control} name="mobile" kind="digits" label="موبایل" required maxLength={11} />
        {isRolesApiConfigured ? (
          <FormField control={control} name="roleId" label="نقش" required
            render={(f) => (
              <LookupSelect query={roles} value={(f.value as number | undefined) ?? undefined}
                onChange={f.onChange} onBlur={f.onBlur} />
            )} />
        ) : (
          <>
            <Alert type="warning" showIcon style={{ marginBottom: 12 }}
              message="فهرست نقش‌ها در API تعریف نشده است (VITE_ROLES_ENDPOINT). شناسه نقش را دستی وارد کنید." />
            <Field control={control} name="roleId" kind="number" label="شناسه نقش" required />
          </>
        )}
      </Form>
    </Drawer>
  );
}
