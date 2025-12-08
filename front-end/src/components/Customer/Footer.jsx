import React from "react";
import { Diamond, Facebook, Instagram, Mail, Phone } from "lucide-react";

const navLinks = [
  { href: "#collections", label: "Bộ Sưu Tập" },
  { href: "#rings", label: "Nhẫn" },
  { href: "#necklaces", label: "Dây Chuyền" },
  { href: "#bracelets", label: "Vòng Tay" },
  { href: "#about", label: "Về Chúng Tôi" },
  { href: "/chat", label: "Liên Hệ" },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-900">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-zinc-900 text-white shadow-sm">
                <Diamond className="h-4 w-4" />
              </span>
              <span className="text-lg font-semibold tracking-wide">JEWELUX</span>
            </div>
            <p className="text-sm text-zinc-600">
              Trang sức tinh xảo cho những khoảnh khắc đáng nhớ. Cam kết chất lượng và dịch vụ tận tâm.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Khám phá</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <a className="transition hover:text-zinc-900" href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Hỗ trợ</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li>Email: Hotro@jewelux.com</li>
              <li>Hotline: 19008888</li>
              <li>Giờ làm việc: 8:00 - 21:00</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Kết nối</h3>
            <div className="mt-3 flex gap-3 text-zinc-700">
              <a
                aria-label="Facebook"
                className="rounded-full p-2 transition hover:bg-zinc-100"
                href="https://www.facebook.com/vinh7085"
                target="_blank"
                rel="noreferrer"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                aria-label="Instagram"
                className="rounded-full p-2 transition hover:bg-zinc-100"
                href="https://www.instagram.com/vinh11424"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a aria-label="Email" className="rounded-full p-2 transition hover:bg-zinc-100" href="mailto:support@jewelux.com">
                <Mail className="h-5 w-5" />
              </a>
              <a aria-label="Hotline" className="rounded-full p-2 transition hover:bg-zinc-100" href="tel:19006868">
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-4 text-sm text-zinc-500">
          © {new Date().getFullYear()} JEWELUX. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
