//gom phần “nghiệp vụ” (gọi API + xử lý giá trị chuẩn) vào một chỗ.
//chuẩn hóa dữ liệu sản phẩm trước khi gửi lên server

import { useCallback, useState } from "react";
import instance from "../api";

// Chuẩn hóa dữ liệu sản phẩm trước khi gửi lên server
const normalizeProductPayload = (product) => {
  const rawPrice =
    typeof product?.price === "string"
      ? product.price.trim()
      : product?.price ?? "";
  const priceValue = Number(rawPrice);

  return {
    ...product,
    price: Number.isNaN(priceValue) ? 0 : priceValue,
  };
};

// Hook tùy chỉnh để quản lý CRUD sản phẩm
export default function useProductCrud() {
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const createProduct = useCallback(async (product) => {
    setSubmitting(true);
    try {
      const payload = normalizeProductPayload(product);
      const response = await instance.post("/api/jewelry", payload);
      return response.data;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const updateProduct = useCallback(async (id, product) => {
    if (!id) {
      throw new Error("Thiếu thông tin sản phẩm để cập nhật");
    }
    setSubmitting(true);
    try {
      const payload = normalizeProductPayload(product);
      const response = await instance.put(`/api/jewelry/${id}`, payload);
      return response.data;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    if (!id) {
      throw new Error("Thiếu sản phẩm để xóa");
    }
    setDeletingId(id);
    try {
      const response = await instance.delete(`/api/jewelry/${id}`);
      return response.data;
    } finally {
      setDeletingId(null);
    }
  }, []);

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    submitting,
    deletingId,
  };
}
