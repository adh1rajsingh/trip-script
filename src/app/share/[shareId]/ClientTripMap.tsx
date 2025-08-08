"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const TripMap = dynamic(() => import("@/components/TripMap"), { ssr: false });

export default function ClientTripMap(props: ComponentProps<typeof TripMap>) {
  return <TripMap {...props} />;
}
