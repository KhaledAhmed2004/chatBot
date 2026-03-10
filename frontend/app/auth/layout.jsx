import { AuthProvider } from "../../context/AuthContext";

export const metadata = {
  title: "ShopBot - Store Owner",
};

export default function AuthLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
