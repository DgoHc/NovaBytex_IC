"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { captureReferralFromURL } from "@/lib/affiliateTracking";

function TrackerContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    captureReferralFromURL();
  }, [searchParams]);

  return null;
}

export function AffiliateTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerContent />
    </Suspense>
  );
}
