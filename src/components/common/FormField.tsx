import type { ReactNode } from "react";
import { Controller, type Control, type ControllerRenderProps, type FieldValues, type Path } from "react-hook-form";
import { Form } from "antd";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  help?: ReactNode;
  render: (field: ControllerRenderProps<T, Path<T>>) => ReactNode;
}

/** اتصال Controller کتابخانه React Hook Form به Form.Item در Ant Design */
export function FormField<T extends FieldValues>({ control, name, label, required, help, render }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Form.Item
          label={label}
          required={required}
          validateStatus={fieldState.error ? "error" : undefined}
          help={fieldState.error?.message ?? help}
        >
          {render(field)}
        </Form.Item>
      )}
    />
  );
}
