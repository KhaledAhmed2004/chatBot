import DashboardProviders from "../../components/dashboard/DashboardProviders";

export const metadata = {
  title: "Dashboard - ShopBot",
};

export default function DashboardLayout({ children }) {
  return <DashboardProviders>{children}</DashboardProviders>;
}
