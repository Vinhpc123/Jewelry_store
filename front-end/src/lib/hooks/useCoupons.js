import { useCallback, useEffect, useState } from "react";
import instance, { getStoredToken, setAuthToken } from "../api";

const normalizePayload = (coupon) => {
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  };

  return {
    ...coupon,
    value: toNumber(coupon.value),
    minOrder: toNumber(coupon.minOrder),
    maxDiscount: toNumber(coupon.maxDiscount),
    usageLimit: toNumber(coupon.usageLimit),
    active: Boolean(coupon.active),
  };
};

export default function useCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await instance.get("/api/admin/coupons");
      setCoupons(res.data || []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Khong the tai danh sach ma giam gia");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (token) setAuthToken(token);
    fetchCoupons();
  }, [fetchCoupons]);

  const createCoupon = useCallback(
    async (payload) => {
      setSaving(true);
      try {
        const res = await instance.post("/api/admin/coupons", normalizePayload(payload));
        await fetchCoupons();
        return res.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchCoupons]
  );

  const updateCoupon = useCallback(
    async (id, payload) => {
      if (!id) throw new Error("Thieu ma coupon");
      setSaving(true);
      try {
        const res = await instance.put(`/api/admin/coupons/${id}`, normalizePayload(payload));
        await fetchCoupons();
        return res.data;
      } finally {
        setSaving(false);
      }
    },
    [fetchCoupons]
  );

  const deleteCoupon = useCallback(
    async (id) => {
      if (!id) throw new Error("Thieu ma coupon");
      setDeletingId(id);
      try {
        await instance.delete(`/api/admin/coupons/${id}`);
        await fetchCoupons();
      } finally {
        setDeletingId(null);
      }
    },
    [fetchCoupons]
  );

  return {
    coupons,
    loading,
    error,
    saving,
    deletingId,
    refresh: fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  };
}
