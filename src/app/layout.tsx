import type { Metadata } from "next";
import { ThemeProvider } from "@/contexts/theme-context";
import { LanguageProvider } from "@/contexts/language-context";
import "./globals.css";
import "tdesign-react/es/style/index.css";

export const metadata: Metadata = {
  title: "LLM 显存计算器 - 专业GPU显存需求分析工具",
  description: "专业的AI大模型显存（VRAM）计算工具，支持推理、训练、微调等多种场景，精确估算GPU显存需求，智能推荐NVIDIA GPU方案",
  keywords: ["显存计算器", "VRAM", "GPU", "大模型", "LLM", "推理", "训练", "微调", "显存估算"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "LLM 显存计算器",
    description: "专业的AI大模型GPU显存需求分析工具",
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
