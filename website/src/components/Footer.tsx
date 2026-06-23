import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1C1C1E] text-[#888] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10 flex-shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="Accessories by DN Logo"
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              </div>
              <span
                className="text-white text-sm font-semibold tracking-[0.12em] uppercase"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "15px" }}
              >
                Accessories by DN
              </span>
            </div>
            <p className="text-xs text-[#666] leading-relaxed max-w-[200px]">
              Your destination for trendy and aesthetic fashion jewelry.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-5">
              <a
                href="https://www.facebook.com/profile.php?id=100090141546352"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 hover:border-[#C9A84C] hover:bg-white/5 transition-all duration-200"
              >
                <Image src="/icons/facebook.svg" alt="Facebook" width={15} height={15} />
              </a>
              <a
                href="https://www.instagram.com/accessories_by_dn_?igsh=bjNqbDV5MHBIOWlt"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 hover:border-[#C9A84C] hover:bg-white/5 transition-all duration-200"
              >
                <Image src="/icons/instagram.svg" alt="Instagram" width={15} height={15} />
              </a>
              <a
                href="https://www.tiktok.com/@dnfashionjewellery25?_r=1&_t=ZS-972Dv3H8MdD"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 hover:border-[#C9A84C] hover:bg-white/5 transition-all duration-200"
              >
                <Image src="/icons/tiktok.svg" alt="TikTok" width={15} height={15} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "Services", href: "/#services" },
                { label: "Contact", href: "/contact" },
                { label: "Privacy Policy", href: "#services" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-xs text-[#666] hover:text-[#C9A84C] tracking-wide transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-4">
              Follow Us
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Facebook", icon: "/icons/facebook.svg", href: "https://www.facebook.com/profile.php?id=100090141546352" },
                { label: "Instagram", icon: "/icons/instagram.svg", href: "https://www.instagram.com/accessories_by_dn_?igsh=bjNqbDV5MHBIOWlt" },
                { label: "TikTok", icon: "/icons/tiktok.svg", href: "https://www.tiktok.com/@dnfashionjewellery25?_r=1&_t=ZS-972Dv3H8MdD" },
              ].map(({ label, icon, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-xs text-[#666] hover:text-[#C9A84C] tracking-wide transition-colors duration-150 group"
                  >
                    <span className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10 group-hover:border-[#C9A84C] transition-colors duration-150">
                      <Image src={icon} alt={label} width={13} height={13} />
                    </span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-4">
              Contact Us
            </h3>
            <address className="not-italic space-y-3">
              <p className="text-xs text-[#666] leading-relaxed">
                158, Rajamahavihara Rd,<br />
                Mirihana, Kotte,<br />
                Sri Lanka 10100
              </p>
              <a
                href="mailto:dinushenya891@gmail.com"
                className="text-xs text-[#666] hover:text-[#C9A84C] tracking-wide transition-colors duration-150 block"
              >
                dinushenya891@gmail.com
              </a>
            </address>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-[#444] tracking-wide">
            &copy; {currentYear} Accessories by DN. All rights reserved.
          </p>
          <p className="text-[11px] text-[#333] tracking-wide">
            Crafted with care in Sri Lanka
          </p>
        </div>

      </div>
    </footer>
  );
}