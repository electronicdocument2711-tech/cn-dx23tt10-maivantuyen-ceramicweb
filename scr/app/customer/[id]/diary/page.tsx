"use client";
import TreatmentDiaryCreate from "@/com/customer/TreatmentDiaryCreate";
import TreatmentDiaryList from "@/com/customer/TreatmentDiaryList";
import { useState } from "react";

const DiaryPage: React.FC = () => {
  const [isCreatingDiary, setIsCreatingDiary] = useState(false);

  // UI TẠO NHẬT KÝ ĐIỀU TRỊ
  if (isCreatingDiary) {
    return <TreatmentDiaryCreate onAction={() => setIsCreatingDiary(false)} />;
  }
  // UI DANH SÁCH NHẬT KÝ ĐIỀU TRỊ
  return <TreatmentDiaryList onCreate={() => setIsCreatingDiary(true)} />;
};
export default DiaryPage;
