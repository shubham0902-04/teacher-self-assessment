"use client";

import { useParams } from "next/navigation";
import DirectorEvaluationView from "@/app/components/director/DirectorEvaluationView";

export default function ViewFacultyEvaluationPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <DirectorEvaluationView 
      id={id} 
      backUrl="/director/faculty" 
    />
  );
}
