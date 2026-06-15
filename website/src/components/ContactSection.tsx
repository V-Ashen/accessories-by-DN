"use client";

import Image from "next/image";
import { MapPin, Mail, PhoneCall } from "lucide-react"; // Vector icons for contact options

export default function ContactSection() {
  return (
    <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8" id="contact">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Get In Touch</h2>
        <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
          Have a question about our collections or need help with your order? Reach out to our dedicated team anytime.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Our Location */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <MapPin size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Our Store</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[220px]">
              158, Rajamahavihara rd, Mirihana, kotte., Kotte, Sri Lanka, 10100
            </p>
          </div>

          {/* Card 2: Email Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Mail size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Email Us</h3>
            <p className="text-sm text-slate-500 mb-4">
              dinushenya891@gmail.com
            </p>
            <a 
              href="mailto:dinushenya891@gmail.com" 
              className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              Send an Email
            </a>
          </div>

          {/* Card 3: Social Connections */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <PhoneCall size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Connect Socially</h3>
            <p className="text-sm text-slate-500 mb-4">Follow us for daily drops and style inspiration!</p>
            
            {/* Dynamic Social Icons matching your exact links */}
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/profile.php?id=100090141546352" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 border rounded-full hover:bg-blue-50 transition"
              >
                <Image src="/icons/facebook.svg" alt="Facebook" width={24} height={24} />
              </a>
              <a 
                href="https://www.instagram.com/accessories_by_dn_?igsh=bjNqbDV5MHBlOWlt" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 border rounded-full hover:bg-purple-50 transition"
              >
                <Image src="/icons/instagram.svg" alt="Instagram" width={24} height={24} />
              </a>
              <a 
                href="https://www.tiktok.com/@dnfashionjewellery25?_r=1&_t=ZS-972Dv3H8MdD" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 border rounded-full hover:bg-slate-100 transition"
              >
                <Image src="/icons/tiktok.svg" alt="TikTok" width={24} height={24} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}