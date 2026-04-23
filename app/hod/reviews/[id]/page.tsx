"use client";

import { useParams } from "next/navigation";
import EvaluationDetail from "@/app/components/hod/EvaluationDetail";

export default function HODPendingReviewPage() {
  const params = useParams<{ id: string }>();
  
  if (!params.id) return null;
  
  return <EvaluationDetail id={params.id} backUrl="/hod/reviews" />;
}
