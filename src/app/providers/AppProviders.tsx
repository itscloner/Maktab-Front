import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { App as AntApp, ConfigProvider } from "antd";
import faIR from "antd/locale/fa_IR";
import { queryClient } from "@/lib/queryClient";
import { theme } from "./theme";
import { AuthProvider } from "@/features/auth/AuthContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      direction="rtl"
      locale={faIR}
      theme={theme}
    >
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
}
