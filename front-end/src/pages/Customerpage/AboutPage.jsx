import React from "react";
import Header from "../../components/Customer/Header";
import Footer from "../../components/Customer/Footer";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-white text-[#1f1a17]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#f3ebe2] via-[#f8f4ef] to-[#fdfbf7]">
          <div className="absolute left-6 top-10 h-32 w-32 rounded-full bg-[#d7c1ad]/30 blur-3xl" />
          <div className="absolute right-10 bottom-8 h-44 w-44 rounded-full bg-[#c4a384]/25 blur-3xl" />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-16 lg:px-10">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8f735c]">
                Về chúng tôi
              </p>
              <h1 className="text-3xl font-bold leading-tight text-[#2f241a] sm:text-4xl">
                Tinh hoa trang sức, tạo ra cho những khoảnh khắc đáng giá
              </h1>
              <p className="max-w-2xl text-sm text-[#5f4a38] sm:text-base">
                Từ xưởng chế tác nhỏ, chúng tôi kết hợp kỹ nghệ thủ công và công nghệ hiện đại
                để tạo ra những thiết kế thanh lịch, bền bỉ và riêng biệt cho từng khách hàng.
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#9a785d]">
                <span className="rounded-full bg-white px-4 py-2 ring-1 ring-[#e4d2c0]">Thủ công</span>
                <span className="rounded-full bg-white px-4 py-2 ring-1 ring-[#e4d2c0]">Vàng bền vững</span>
                <span className="rounded-full bg-white px-4 py-2 ring-1 ring-[#e4d2c0]">Thiết kế riêng</span>
              </div>
            </div>
            <div className="relative isolate w-full max-w-md overflow-hidden rounded-3xl bg-white/80 shadow-lg ring-1 ring-[#e5d6c7]">
              <img
                src="/about.jpg"
                alt="Studio trang sức Jewelux"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "10+ năm", desc: "Kinh nghiệm chế tác trang sức cao cấp" },
              { title: "8.000+", desc: "Sản phẩm đến tay khách hàng mỗi năm" },
              { title: "120+", desc: "Thiết kế độc quyền được bảo hộ" },
              { title: "4.9/5", desc: "Mức độ hài lòng của khách hàng" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-[#f8f3ed] px-4 py-5 text-center shadow-sm ring-1 ring-[#eadfce]"
              >
                <p className="text-xl font-bold text-[#2f241a]">{item.title}</p>
                <p className="mt-1 text-xs text-[#6d5a48]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story & Values */}
        <section className="mx-auto max-w-6xl px-6 pb-16 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfce]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9c7c61]">
                Câu chuyện của chúng tôi
              </p>
              <h2 className="text-2xl font-semibold text-[#2f241a]">Sinh ra từ sự cầu toàn</h2>
              <p className="text-sm text-[#5f4a38]">
                Jewelux được thành lập bởi một nhóm nghệ nhân và nhà thiết kế mong muốn tạo ra những
                tác phẩm trang sức không chỉ đẹp mà còn gắn bó lâu dài. Mỗi sản phẩm được kiểm soát
                chặt chẽ từ khối nguồn nguyên liệu đến khi đến tay bạn.
              </p>
              <p className="text-sm text-[#5f4a38]">
                Chuỗi cung ứng minh bạch, nguyên liệu có trách nhiệm và tay nghề thủ công chính là
                cam kết của chúng tôi đối với khách hàng.
              </p>
            </div>
            <div className="space-y-4 rounded-3xl bg-[#f9f5f0] p-6 shadow-sm ring-1 ring-[#eadfce]">
              <h3 className="text-lg font-semibold text-[#2f241a]">Giá trị nổi bật</h3>
              {[
                { title: "Thiết kế tinh xảo", desc: "Cân bằng giữa sang trọng và tiện dụng" },
                { title: "Chất liệu chân chính", desc: "Nguồn gốc rõ ràng, kiểm định đầy đủ" },
                { title: "Dịch vụ chu đáo", desc: "Bảo hành làm sạch, điều chỉnh miễn phí" },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#e6d8c9]">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#c49d79]" />
                  <div>
                    <p className="text-sm font-semibold text-[#2f241a]">{item.title}</p>
                    <p className="text-xs text-[#6d5a48]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mx-auto max-w-6xl px-6 pb-16 lg:px-10">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfce]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9c7c61]">
                  Đội ngũ của chúng tôi
                </p>
                <h3 className="text-xl font-semibold text-[#2f241a]">Những người làm nên sự khác biệt</h3>
              </div>
              <div className="rounded-full bg-[#f7efe6] px-4 py-2 text-xs font-semibold text-[#9c7c61] ring-1 ring-[#e3d2c2]">
                24 nghệ nhân và nhà thiết kế
              </div>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Lan Anh", role: "Trưởng nhóm thiết kế", quote: "Mỗi đường nét đều cần có ý nghĩa." },
                { name: "Quang Minh", role: "Thợ kim hoàn trưởng", quote: "Tinh xảo là kết quả của kỷ luật và đam mê." },
                { name: "Gia Han", role: "Chuyên gia đá quý", quote: "Lựa chọn đá quý phù hợp là sự cá nhân hóa tốt nhất." },
              ].map((member) => (
                <div
                  key={member.name}
                  className="flex flex-col gap-3 rounded-2xl bg-[#f9f5f0] p-5 ring-1 ring-[#eadfce]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-[#e8d9c7]" />
                    <div>
                      <p className="text-sm font-semibold text-[#2f241a]">{member.name}</p>
                      <p className="text-xs text-[#7b6654]">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#6d5a48]">{member.quote}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2f241a] to-[#4a382b] p-8 text-white shadow-lg">
            <div className="absolute right-10 top-8 h-24 w-24 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Liên hệ</p>
                <h3 className="text-2xl font-semibold">Cần một thiết kế riêng?</h3>
                <p className="text-sm text-white/80">
                  Đặt lịch tư vấn để chúng tôi giúp bạn tạo nên mẫu trang sức theo phong cách riêng.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#2f241a] shadow">
                  Đặt lịch tư vấn
                </button>
                <button className="rounded-full border border-white/60 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10">
                  Xem bộ sưu tập
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
