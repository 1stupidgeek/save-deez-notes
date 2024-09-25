'use client';

import TextArea from './_components/TextArea';
import SideNav from './_components/SideNav';

export default function Home() {
  return (
    <main className='flex w-full h-screen bg-black justify-between'>
      <div>
        <SideNav />
      </div>
      <TextArea />

    </main>
  );
};