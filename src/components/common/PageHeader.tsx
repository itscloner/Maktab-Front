import type { CSSProperties, ReactNode } from "react";
import { Flex, Typography } from "antd";

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
  extra?: ReactNode;
}

export function PageHeader({ title, description, icon, extra }: Props) {
  return (
    <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 18 }}>
      <Flex align="center" gap={14}>
        {icon && (
          <div className="icon-tile" style={{ "--c1": "#6366f1", "--c2": "#a855f7", "--c3": "#4338ca" } as CSSProperties}>
            {icon}
          </div>
        )}
        <div>
          <Typography.Title level={4} style={{ margin: 0, color: "#1e1b4b" }}>
            {title}
          </Typography.Title>
          {description && <Typography.Text type="secondary">{description}</Typography.Text>}
        </div>
      </Flex>
      {extra}
    </Flex>
  );
}
