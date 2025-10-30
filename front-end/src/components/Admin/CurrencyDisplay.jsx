//định dạng tiền tệ VND
import React from "react";

export default function CurrencyDisplay({
  value,
  currency = "VND",
  locale,
  maximumFractionDigits = 0,
  className = "",
}) {
  //điều kiện giá trị rỗng
  if (value === null || value === undefined || value === "") {
    return <span className={className}>-</span>;
  }
  //chuyển đổi giá trị sang số
  const raw = typeof value === "number" ? value : String(value).trim();
  const num = typeof raw === "number" ? raw : Number(raw.replace(/[^0-9.-]+/g, ""));

  if (Number.isNaN(num)) {
    return <span className={className}>-</span>;
  }
  try {
    const formatted = num.toLocaleString(locale || undefined, {
      style: "currency",
      currency,
      maximumFractionDigits,
    });
    return <span className={className}>{formatted}</span>;
  } catch {
    //nếu có lỗi trong quá trình định dạng, trả về số thô
    return <span className={className}>{num.toLocaleString()}</span>;
  }
}
