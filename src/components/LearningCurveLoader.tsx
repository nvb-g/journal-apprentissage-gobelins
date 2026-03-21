"use client";

import dynamic from "next/dynamic";

const LearningCurve3D = dynamic(() => import("./LearningCurve3D"), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen relative left-1/2 -translate-x-1/2 flex items-center justify-center bg-[var(--bg)]">
      <p className="text-sm text-[var(--light)]">Chargement de la vue 3D...</p>
    </div>
  ),
});

export default function LearningCurveLoader() {
  return <LearningCurve3D />;
}
