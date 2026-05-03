"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// 1. Gallery Data Array (Easier to manage in React)
const galleryItems = [
  { id: 1, src: "/img/azek-power-washed.webp", category: "washing", caption: "Screen Porch Power Washing" },
  { id: 2, src: "/img/patio-power-washed.webp", category: "washing", caption: "Patio Power Washed" },
  { id: 3, src: "/img/deck-refinishing-job.webp", category: "decks", caption: "Deck Refinished" },
  { id: 4, src: "/img/shed-painting-job.webp", category: "painting", caption: "Shed Painting Job" },
  { id: 5, src: "/img/family-room-after.png", category: "painting", caption: "Family Room Painting" },
  // Add the rest of your images here following this pattern...
];

export default function LandingPage() {
  // React State for Gallery Filter
  const [activeFilter, setActiveFilter] = useState("all");

  // React State for Chatbot
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the Happy Oak Assistant. How can I help you with your home today?" }
  ]);

  // Handle Gallery Filtering
  const filteredGallery = galleryItems.filter(
    (item) => activeFilter === "all" || item.category === activeFilter
  );

  // Handle Chat Submission (Connected to your new API route!)
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newMessages = [...messages, { role: "user", content: chatInput }];
    setMessages(newMessages);
    setChatInput("");
    setMessages((prev) => [...prev, { role: "assistant", content: "..." }]); // Loading indicator

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await response.json();

      setMessages((prev) => {
        const filtered = prev.slice(0, -1); // Remove loading dots
        return [...filtered, { role: "assistant", content: data.reply || "Error." }];
      });
    } catch (error) {
      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: "Network error." }]);
    }
  };

  return (
    <div className="font-sans text-gray-800 bg-[url('/img/HOPLogoBG.png')] bg-repeat">

      {/* HEADER */}
      <header className="w-full h-[700px] bg-brand-brown bg-[url('/img/header-bg-1.png')] bg-cover bg-fixed bg-center relative">
        <h1 className="text-white text-5xl font-bold text-center py-4 relative z-10">Happy Oak Painting</h1>
        <div className="max-w-6xl mx-auto px-4 h-full relative">
          <nav className="w-full text-right pt-4 relative z-10">
            {['Home', 'Overview', 'Services', 'Gallery', 'Testimonials', 'Contact Us'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase().split(' ')[0]}`} className="text-white text-xl mx-3 hover:bg-red-800/80 hover:px-2 rounded transition-all">
                {item}
              </Link>
            ))}
          </nav>
          <div className="absolute top-1/2 -translate-y-1/2 w-full text-white">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Bernardsville’s Trusted Painting Experts</h2>
            <p className="text-2xl mb-8 drop-shadow-md">Premium interior & exterior painting, pressure washing, and wood restoration.</p>
            <Link href="#contact" className="inline-block bg-trusty-blue text-white px-8 py-4 text-xl font-semibold rounded-md shadow-[0_4px_15px_rgba(29,101,166,0.3)] hover:bg-blossom-yellow hover:text-brand-brown hover:-translate-y-1 transition-all">
              Get a Free Estimate
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ABOUT */}
        <section id="overview" className="py-20 max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-2/5 rounded-xl overflow-hidden shadow-2xl">
            <img src="/img/logo-on-lake-slim.png" alt="Happy Oak Painting team" className="w-full h-auto" />
          </div>
          <article className="md:w-3/5 text-left">
            <h3 className="text-4xl font-bold mb-5 text-brand-brown">About Happy Oak Painting</h3>
            <p className="text-lg leading-relaxed mb-4 text-gray-700">
              At Happy Oak Painting & Handyman Services, we don’t just work in Bernardsville—we care for the homes in our community. From meticulous interior and exterior painting to expert deck restoration and pressure washing, our team brings true craftsmanship to every project.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              We believe that honest communication and reliable service are just as important as a flawless finish. When you partner with us, you’re choosing a local team dedicated to protecting and beautifying your biggest investment.
            </p>
          </article>
        </section>

        {/* SERVICES */}
        <section id="services" className="py-16 max-w-6xl mx-auto px-4">
          <h3 className="text-4xl text-center mb-10 text-brand-brown">Our Core Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all border-none">
              <img src="/img/pressure-washer-04.png" alt="Pressure Washing" className="w-full h-64 object-cover" />
              <div className="p-6 text-center">
                <h4 className="text-xl font-bold mb-3 text-brand-brown">Pressure Washing</h4>
                <p className="text-gray-500 mb-3">Sidewalks, driveways, patios, and decks can become dangerous and slippery if left dirty.</p>
                <p className="text-gray-500">We use products safe for wood, vinyl, stucco, and surrounding shrubbery.</p>
              </div>
            </div>
            {/* Service Card 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all border-none">
              <img src="/img/family-room-after.png" alt="Interior Painting" className="w-full h-64 object-cover" />
              <div className="p-6 text-center">
                <h4 className="text-xl font-bold mb-3 text-brand-brown">Interior Painting</h4>
                <p className="text-gray-500 mb-3">We take care of your interior painting needs from ceiling to floor. We prep all surfaces, repair drywall, and cover stains.</p>
                <p className="text-gray-500">Using high-quality paint, we deliver beautiful, lasting results.</p>
              </div>
            </div>
            {/* Service Card 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all border-none">
              <img src="/img/refinished-deck.png" alt="Deck Refinishing" className="w-full h-64 object-cover" />
              <div className="p-6 text-center">
                <h4 className="text-xl font-bold mb-3 text-brand-brown">Deck Refinishing</h4>
                <p className="text-gray-500 mb-3">Enjoy your deck year-round! We repair, refinish, paint, and maintain wood and composite decks.</p>
                <p className="text-gray-500">Wood decks need regular cleaning and staining. Let us handle the maintenance!</p>
              </div>
            </div>
          </div>
        </section>

        {/* GALLERY (With React State Filtering) */}
        <section id="gallery" className="py-16 max-w-6xl mx-auto px-4 overflow-hidden">
          <h3 className="text-4xl text-center mb-8 text-brand-brown">Our Work Gallery</h3>

          {/* Filters */}
          <div className="flex justify-center flex-wrap gap-3 mb-10">
            {[
              { id: 'all', label: 'All Work' },
              { id: 'painting', label: 'Interior & Exterior Painting' },
              { id: 'washing', label: 'Power Washing' },
              { id: 'decks', label: 'Decks & Wood' }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setActiveFilter(btn.id)}
                className={`px-5 py-2 rounded-full font-semibold border-2 transition-all ${activeFilter === btn.id ? 'bg-trusty-blue text-white border-trusty-blue' : 'border-trusty-blue text-trusty-blue hover:bg-trusty-blue hover:text-white'}`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <div key={item.id} className="relative rounded-lg overflow-hidden shadow-lg group bg-white cursor-pointer">
                <img src={item.src} alt={item.caption} className="w-full aspect-video object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 w-full bg-brand-brown/85 text-white text-sm p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.caption}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-trusty-blue">
              <p className="mb-4 text-lg"><span className="text-trusty-blue mr-2 text-xl">📍</span> <strong>Mailing Address</strong><br />23 Quimby Ln #853<br />Bernardsville, NJ 07924</p>
              <p className="text-lg"><span className="text-trusty-blue mr-2 text-xl">✉️</span> <strong>Email Us</strong><br /><a href="mailto:happyoak375@gmail.com" className="text-brand-gold font-bold hover:underline">happyoak375@gmail.com</a></p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-brand-gold flex flex-col justify-center items-center text-center">
              <p className="text-xl mb-2"><span className="text-trusty-blue mr-2">📞</span> <strong>Happy Oak Painting</strong></p>
              <a href="tel:+19088017100" className="text-brand-gold text-4xl font-bold hover:underline drop-shadow-sm">(908) 801-7100</a>
              <p className="mt-4 text-gray-600">Call or text us today for a free estimate!</p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-brand-brown text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h4 className="text-2xl font-bold text-warm-white mb-4">Happy Oak Painting</h4>
          <p className="text-brand-beige/80 mb-6 max-w-2xl mx-auto">Top-quality painting, pressure washing, and wood restoration services dedicated to protecting and beautifying your home in Bernardsville, NJ.</p>
          <p className="text-sm text-white/50 border-t border-white/10 pt-6">
            &copy; 2026 Happy Oak Painting and Handyman Services. <Link href="/login" className="hover:text-white transition-colors">All Rights Reserved.</Link>
          </p>
        </div>
      </footer>

      {/* CHATBOT UI */}
      {!isChatOpen && (
        <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 bg-trusty-blue text-white px-6 py-3 rounded-full font-semibold shadow-2xl hover:bg-oak-brown hover:-translate-y-1 transition-all z-50">
          💬 Chat with us
        </button>
      )}

      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-[450px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-trusty-blue text-white p-4 flex justify-between items-center font-bold">
            Happy Oak Assistant
            <button onClick={() => setIsChatOpen(false)} className="text-2xl hover:text-gray-200 leading-none">&times;</button>
          </div>
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 bg-brand-beige">
            {messages.map((msg, i) => (
              <div key={i} className={`p-3 rounded-lg max-w-[85%] text-sm ${msg.role === 'assistant' ? 'bg-gray-200 text-brand-brown self-start rounded-bl-sm' : 'bg-trusty-blue text-white self-end rounded-br-sm'}`}>
                {msg.content}
              </div>
            ))}
          </div>
          <div className="flex p-3 border-t bg-white">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-grow border border-gray-300 rounded-full px-4 py-2 outline-none focus:border-trusty-blue"
            />
            <button onClick={handleSendMessage} className="ml-2 bg-trusty-blue text-white px-4 py-2 rounded-full font-bold">Send</button>
          </div>
        </div>
      )}

    </div>
  );
}