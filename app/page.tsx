"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_API_PROXY === "1") {
      router.push("/dashboard");
      return;
    }
    router.push("/login");
  }, [router]);

  return null;
}
