import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Breadcrumb, Button, Drawer, Dropdown, Grid, Layout, Menu, Typography, type MenuProps } from "antd";
import {
  AuditOutlined, DashboardOutlined, FileAddOutlined, FolderAddOutlined, FolderOpenOutlined, HeartOutlined,
  IdcardOutlined, InboxOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SafetyCertificateOutlined,
  TeamOutlined, UnorderedListOutlined, UserAddOutlined, UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/features/auth/AuthContext";

const { Header, Sider, Content } = Layout;

type Item = { key: string; label: string; icon: React.ReactNode };
interface Group { key: string; label: string; icon: React.ReactNode; children: Item[] }

/** منوی دوسطحی: گروه (منو) و زیرمنو؛ هر زیرمنو یک مسیر واقعی است. */
const GROUPS: Group[] = [
  {
    key: "g-admin", label: "مدیریت سامانه", icon: <SafetyCertificateOutlined />,
    children: [{ key: "/users", label: "کاربران", icon: <TeamOutlined /> }],
  },
  {
    key: "g-aid", label: "مددجویان", icon: <HeartOutlined />,
    children: [
      { key: "/persons", label: "فهرست اشخاص", icon: <IdcardOutlined /> },
      { key: "/persons?new=1", label: "ثبت شخص جدید", icon: <UserAddOutlined /> },
      { key: "/cases", label: "فهرست پرونده‌ها", icon: <FolderOpenOutlined /> },
      { key: "/cases?new=1", label: "ایجاد پرونده", icon: <FolderAddOutlined /> },
    ],
  },
  {
    key: "g-req", label: "درخواست‌ها", icon: <InboxOutlined />,
    children: [
      { key: "/requests", label: "فهرست درخواست‌ها", icon: <UnorderedListOutlined /> },
      { key: "/requests?new=1", label: "ثبت درخواست جدید", icon: <FileAddOutlined /> },
    ],
  },
];

const MENU_ITEMS: MenuProps["items"] = [
  { key: "/", label: "داشبورد", icon: <DashboardOutlined /> },
  ...GROUPS.map((g) => ({
    key: g.key, label: g.label, icon: g.icon,
    children: g.children.map((c) => ({ key: c.key, label: c.label, icon: c.icon })),
  })),
];

const groupOf = (key: string) => GROUPS.find((g) => g.children.some((c) => c.key === key));

export function MainLayout() {
  const screens = Grid.useBreakpoint();
  const isMobile = screens.lg === false; // زیر ۹۹۲px منو به‌صورت Drawer باز می‌شود
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userName, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const selected = location.pathname === "/" ? "/" : location.pathname;
  const group = groupOf(selected);
  const [openKeys, setOpenKeys] = useState<string[]>(group ? [group.key] : []);

  useEffect(() => {
    const g = groupOf(selected);
    if (g) setOpenKeys((prev) => (prev.includes(g.key) ? prev : [...prev, g.key]));
  }, [selected]);

  const crumbs = useMemo(() => {
    const items: { title: React.ReactNode }[] = [{ title: <Link to="/">خانه</Link> }];
    const g = groupOf(selected);
    const child = g?.children.find((c) => c.key === selected);
    if (g && child) items.push({ title: g.label }, { title: child.label });
    return items;
  }, [selected]);

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      {!isMobile && <Sider
        className="sider-3d" trigger={null} collapsible collapsed={collapsed} onCollapse={setCollapsed}
        breakpoint="lg" collapsedWidth={72} width={260} theme="dark"
      >
        <div style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div className="logo-tile"><AuditOutlined /></div>
          {!collapsed && (
            <div style={{ lineHeight: 1.3 }}>
              <Typography.Text strong style={{ color: "#fff", fontSize: 16 }}>خیریه مکتب طه</Typography.Text>
              <div style={{ color: "rgba(199,210,254,.75)", fontSize: 12 }}>سامانه مدیریت</div>
            </div>
          )}
        </div>
        <Menu
          theme="dark" mode="inline" items={MENU_ITEMS} style={{ padding: "8px 10px", border: 0 }}
          selectedKeys={[selected]} openKeys={collapsed ? undefined : openKeys}
          onOpenChange={setOpenKeys} onClick={(e) => navigate(e.key)}
        />
      </Sider>}
      <Drawer placement="right" open={isMobile && mobileOpen} onClose={() => setMobileOpen(false)} width={280}
        styles={{ body: { padding: 0, background: "#1e1b4b" }, header: { display: "none" } }}>
        <Menu theme="dark" mode="inline" items={MENU_ITEMS} style={{ padding: 10, border: 0, background: "transparent" }}
          selectedKeys={[selected]} openKeys={openKeys} onOpenChange={setOpenKeys}
          onClick={(e) => { navigate(e.key); setMobileOpen(false); }} />
      </Drawer>
      <Layout style={{ background: "transparent" }}>
        <Header className="header-glass" style={{ padding: "0 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Button type="text" aria-label="باز و بسته کردن منو" onClick={() => (isMobile ? setMobileOpen(true) : setCollapsed((c) => !c))}
            icon={collapsed && !isMobile ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} style={{ fontSize: 18 }} />
          <Dropdown
            menu={{ items: [{ key: "logout", icon: <LogoutOutlined />, label: "خروج از حساب", danger: true, onClick: signOut }] }}
            trigger={["click"]}
          >
            <Button type="text" style={{ height: 44, borderRadius: 14 }}>
              <Avatar size={30} icon={<UserOutlined />}
                style={{ marginInlineEnd: 8, background: "linear-gradient(135deg,#6366f1,#a855f7)", } as CSSProperties} />
              {!isMobile && (userName ?? "کاربر")}
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ margin: isMobile ? 10 : 18 }}>
          <Breadcrumb items={crumbs} style={{ marginBottom: 12 }} />
          <div className="content-card"><Outlet /></div>
        </Content>
      </Layout>
    </Layout>
  );
}
