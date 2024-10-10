"use client";

import TextArea from "@/app/components/TextArea";
import SideNav from "@/app/components/SideNav";

export default function Home() {
  return (
    <main className="flex w-full min-h-screen bg-black justify-between">
      <div>
        <SideNav />
      </div>
      <TextArea />
    </main>
  );
}
