"use client";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function Logo({ width = 30, height = 30, alt = "Logo", ...props }) {
  const { theme } = useTheme();
  const source = theme === "light" ? "/logo.svg" : "/logo-dark.svg";
  return <Image src={source} alt={alt} width={width} height={height} {...props} />;
}
