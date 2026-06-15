// website/src/components/Footer.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div>
          <Image src="/logo.jpg" alt="Accessories by DN Logo" width={50} height={50} />
          <p className="text-white text-lg font-extrabold mt-3">Accessories by DN</p>
          <p className="text-sm text-slate-400 mt-2">
            Your destination for trendy and aesthetic fashion jewelry.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-white text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link href="/" className="hover:text-blue-400">Home</Link></li>
            <li><Link href="#about" className="hover:text-blue-400">About Us</Link></li>
            <li><Link href="#services" className="hover:text-blue-400">Services</Link></li>
            <li><Link href="#contact" className="hover:text-blue-400">Contact</Link></li>
            {/* TODO: Add actual policy pages later */}
            <li><Link href="/policy" className="hover:text-blue-400">Privacy Policy</Link></li>
            <li><Link href="/policy" className="hover:text-blue-400">Shipping & Returns</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="font-bold text-white text-lg mb-4">Follow Us</h3>
          <ul className="flex flex-col gap-3 text-sm text-slate-300">
            <li>
              <a href="https://www.facebook.com/profile.php?id=100090141546352" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400">
                <Image src="/icons/facebook.svg" alt="Facebook" width={20} height={20} /> Facebook
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/accessories_by_dn_?igsh=bjNqbDV5MHBIOWlt" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400">
                <Image src="/icons/instagram.svg" alt="Instagram" width={20} height={20} /> Instagram
              </a>
            </li>
            <li>
              <a href="https://www.tiktok.com/@dnfashionjewellery25?_r=1&_t=ZS-972Dv3H8MdD" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400">
                <Image src="/icons/tiktok.svg" alt="TikTok" width={20} height={20} /> TikTok
              </a>
            </li>
          </ul>
          {/* TODO: Place Facebook, Instagram, TikTok SVG icons in website/public/icons/ */}
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-bold text-white text-lg mb-4">Contact Us</h3>
          <p className="text-sm text-slate-400">158, Rajamahavihara rd, Mirihana, kotte., Kotte, Sri Lanka, 10100</p>
          <p className="text-sm text-slate-400 mt-2">Email: dinushenya891@gmail.com</p>
        </div>
      </div>

      <div className="border-t border-slate-700 mt-8 pt-6 text-center text-sm text-slate-500">
        &copy; {currentYear} Accessories by DN. All rights reserved.
      </div>
    </footer>
  );
}