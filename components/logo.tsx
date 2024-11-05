import Image from "next/image";

export default function Logo({ width = 30, height = 30, alt = "Logo", ...props }) {
  return <Image src='/logo.svg' alt={alt} width={width} height={height} {...props} />;
}
