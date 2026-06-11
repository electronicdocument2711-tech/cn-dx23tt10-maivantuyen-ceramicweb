"use client";

import NewHeader from "@/com/register/Header";
import AddMembers from "@/com/register/members/AddMembers";

export default function AddMembersPage() {
  return (
    <div className="min-h-screen bg-white">
      <NewHeader currentStep={2} />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <AddMembers />
      </main>
    </div>
  );
}

