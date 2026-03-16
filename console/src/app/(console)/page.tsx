"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function ConsoleRoot() {
  useEffect(() => {
    window.location.replace("/home");
  }, []);
  return null;
}
