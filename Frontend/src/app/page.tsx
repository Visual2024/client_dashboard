'use client'
import { Header } from "@/Components/Layout/Header";
import { Cards } from '../Components/Cards/Cards'
import { Footer } from "@/Components/Layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#ff7f7f] flex flex-col">
      <Header />
      <Cards />
      <Footer />
    </div>
  );
}



