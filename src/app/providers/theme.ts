import type { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    fontFamily: "Vazirmatn, Tahoma, sans-serif",
    colorPrimary: "#6366f1",
    colorInfo: "#6366f1",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorLink: "#6366f1",
    borderRadius: 12,
    borderRadiusLG: 18,
    colorBgLayout: "transparent",
    controlHeight: 38,
    boxShadowSecondary: "0 18px 40px -12px rgba(79,70,229,.35)",
  },
  components: {
    Menu: {
      darkItemBg: "transparent",
      darkSubMenuItemBg: "rgba(255,255,255,.04)",
      darkItemColor: "rgba(224,231,255,.85)",
      darkItemHoverBg: "rgba(255,255,255,.10)",
      darkItemSelectedBg: "transparent",
      itemBorderRadius: 12,
      itemHeight: 44,
      iconSize: 18,
    },
    Table: { headerBg: "#eef2ff", headerColor: "#3730a3", rowHoverBg: "#f5f3ff", borderRadiusLG: 16 },
    Drawer: { colorBgElevated: "#ffffff" },
    Input: { activeShadow: "0 0 0 3px rgba(99,102,241,.18)" },
  },
};
