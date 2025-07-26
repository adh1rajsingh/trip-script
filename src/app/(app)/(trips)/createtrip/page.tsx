"use client";

import ItineraryDate from "@/components/ItineraryDate";
import { useState } from "react";

export default function CreateTrip() {
  const [destination, setDestination] = useState("Paris");
  return (
    <>
      <ItineraryDate
        date={new Date()}
        dayName="Monday"
        month="June"
        dayNumber={1}
      />
      <h1>Work your magic</h1>
    </>
  );
}
