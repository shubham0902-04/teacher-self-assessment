"use client";

import { useParams } from "next/navigation";
import PrincipalEvaluationDetail from "@/app/components/principal/PrincipalEvaluationDetail";

export default function PrincipalReviewDetailPage() {
  const params = useParams<{ id: string }>();
  
  if (!params.id) return null;
  
  return <PrincipalEvaluationDetail id={params.id} backUrl="/principal/reviews" />;
}
