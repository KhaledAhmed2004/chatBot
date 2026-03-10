import "./globals.css";
import { ThemeProvider } from "next-themes";
import ClientProviders from "../components/ClientProviders";

export const metadata = {
  title: "ShopBot Store",
  description: "Your Online Store, Powered by WhatsApp",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛒</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ClientProviders>{children}</ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
