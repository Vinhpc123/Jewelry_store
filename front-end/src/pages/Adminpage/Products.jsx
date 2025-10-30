// src/pages/admin/products.jsx
import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRoute from "../../components/Admin/AdminRoute";
import useAdminData from "../../lib/hooks/useAdminData";
import useProductCrud from "../../lib/hooks/useProductCrud";
import CurrencyDisplay from "../../components/Admin/CurrencyDisplay";
import formatDateTime from "../../components/Admin/formatDateTime";

// Pagination hook + UI component (tách ra)
import usePagination from "../../lib/hooks/usePagination";
import Pagination from "../../components/Admin/Pagination";

export default function Products() {
  const { loading, error, products = [], refresh } = useAdminData();
  const { createProduct, updateProduct, deleteProduct, submitting, deletingId } =
    useProductCrud();

  // modal thêm / sửa sản phẩm
  const [showModal, setShowModal] = React.useState(false);
  const [formMode, setFormMode] = React.useState("create"); // 'create' | 'edit'
  const [editingId, setEditingId] = React.useState(null);

  const [newProduct, setNewProduct] = React.useState({
    title: "",
    category: "",
    description: "",
    price: "",
    image: "",
  });

  // ảnh upload
  const [imageFile, setImageFile] = React.useState(null); // file dùng để upload
  const [imagePreview, setImagePreview] = React.useState(null); // xem trước ảnh (URL object)

  // cleanup object URL on unmount or when imagePreview changes
  React.useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // ---------------------
  // Pagination state (client-side by default)
  // ---------------------
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  // usePagination returns paginated items when given full items array
  const { paginated, totalItems, totalPages, offset } = usePagination(
    products,
    page,
    pageSize
  );

  // whenever pageSize changes ensure page is valid (hook also safe-guards)
  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [pageSize, totalPages, page]);

  // If you later switch to server-side: call refresh({ page, pageSize }) here
  // React.useEffect(() => {
  //   // example if refresh accepts params; adapt to your hook API
  //   if (typeof refresh === "function") refresh({ page, pageSize });
  // }, [page, pageSize]);

  const startIndex = offset;

  // mở modal thêm sản phẩm
  const openAddModal = () => {
    setFormMode("create");
    setEditingId(null);
    setNewProduct({
      title: "",
      category: "",
      description: "",
      price: "",
      image: "",
    });
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const closeAddModal = () => {
    setShowModal(false);
  };

  // upload file lên server, trả về URL
  const uploadFileToServer = async (file) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    return data.url || null;
  };

  // tạo / cập nhật sản phẩm
  const handleSubmit = async () => {
    try {
      let productPayload = { ...newProduct };

      if (imageFile) {
        const uploadedUrl = await uploadFileToServer(imageFile);
        if (!uploadedUrl) throw new Error("Không lấy được URL ảnh sau khi upload");
        productPayload.image = uploadedUrl;
      } else {
        productPayload.image = newProduct.image || "";
      }

      if (formMode === "create") {
        await createProduct(productPayload);
        alert("Thêm sản phẩm thành công!");
      } else {
        if (!editingId) return;
        await updateProduct(editingId, productPayload);
        alert("Cập nhật sản phẩm thành công!");
      }

      // refresh dữ liệu (nếu server-side, refresh nên hỗ trợ page/pageSize)
      await refresh();
      // after refresh, keep user on same page if possible; otherwise effect will correct it
      closeAddModal();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          (formMode === "create" ? "Lỗi khi thêm sản phẩm" : "Lỗi khi cập nhật sản phẩm")
      );
    }
  };

  // xóa sản phẩm
  const handleDelete = React.useCallback(
    async (product) => {
      if (!product?._id) return;
      const confirmed = window.confirm(
        `Bạn chắc chắn muốn xóa "${product.title || "sản phẩm"}"?`
      );
      if (!confirmed) return;
      try {
        await deleteProduct(product._id);
        // refresh sau khi xóa
        await refresh();
      } catch (err) {
        console.error("Delete product failed", err);
        window.alert(err?.response?.data?.message || "Xóa sản phẩm thất bại");
      }
    },
    [deleteProduct, refresh]
  );

  // cập nhật (mở modal edit)
  const handleUpdate = React.useCallback(
    (product) => {
      if (!product?._id) return;

      setFormMode("edit");
      setEditingId(product._id);

      setNewProduct({
        title: product.title || "",
        category:
          typeof product.category === "object"
            ? product.category?.name || ""
            : product.category || "",
        description: product.description || "",
        price:
          product.price === null || product.price === undefined
            ? ""
            : String(product.price),
        image: product.image || "",
      });

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      setImageFile(null);

      setShowModal(true);
    },
    [imagePreview]
  );

  // xử lý khi chọn file ảnh
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    const preview = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(preview);
    // clear server URL in form so UI shows preview file
    setNewProduct({ ...newProduct, image: "" });
  };

  const clearImageSelection = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setImageFile(null);
    setNewProduct({ ...newProduct, image: "" });
  };

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* TITLE + ACTIONS */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openAddModal}
                className="rounded border border-green-500 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50"
              >
                Thêm sản phẩm
              </button>

              <button
                type="button"
                onClick={() => refresh()}
                disabled={loading}
                className="inline-flex items-center rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Làm mới
              </button>
            </div>
          </div>

          {/* LIST / STATUS */}
          {loading ? (
            <div>Đang tải danh sách sản phẩm...</div>
          ) : error ? (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">Lỗi: {error}</div>
          ) : products.length === 0 ? (
            <div className="rounded border border-zinc-200 bg-white p-6 text-center text-zinc-600">
              Hiện chưa có sản phẩm nào.
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded border border-zinc-200 bg-white shadow-sm">
                <table className="min-w-full table-fixed divide-y divide-zinc-200 text-sm">
                  <thead className="bg-zinc-100 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                    <tr>
                      <th className="w-12 text-center px-2 py-3">STT</th>
                      <th className="w-20 text-center px-2 py-3">Ảnh</th>
                      <th className="w-36 text-center px-2 py-3">Sản phẩm</th>
                      <th className="w-36 text-center px-2 py-3">Danh mục</th>
                      <th className="w-28 text-center px-2 py-3">Đơn giá</th>
                      <th className="w-[300px] text-center px-2 py-3">Mô tả</th>
                      <th className="w-44 text-center px-2 py-3">Ngày tạo</th>
                      <th className="w-24 text-center px-2 py-3">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-200">
                    {paginated.map((product, idx) => (
                      <tr key={product._id || idx} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 text-center">{startIndex + idx + 1}</td>

                        <td className="px-4 py-3 text-center">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title || "Ảnh sản phẩm"}
                              className="h-12 w-12 rounded object-cover border border-zinc-200 mx-auto"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs mx-auto">
                              Trống
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center font-medium text-zinc-900">{product.title || "Không tên"}</td>

                        <td className="px-4 py-3 text-center text-zinc-600">
                          {product.category?.name || product.category || "-"}
                        </td>

                        <td className="px-4 py-3 text-center text-zinc-600">
                          <CurrencyDisplay value={product.price} />
                        </td>

                        <td className="px-4 py-3 text-center text-zinc-600 truncate max-w-[300px]">{product.description || "-"}</td>

                        <td className="px-4 py-3 text-center text-zinc-600">{formatDateTime(product.createdAt)}</td>

                        <td className="px-2 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdate(product)}
                              className="rounded border border-blue-500 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product)}
                              disabled={deletingId === product._id}
                              className="rounded border border-red-500 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === product._id ? "Đang xóa..." : "Xóa"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* bottom pager */}
              <div className="mt-3">
                <div className="flex items-center justify-end">
                  <Pagination
                    page={page}
                    setPage={setPage}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    offset={offset}
                  />
                </div>
              </div>
            </>
          )}

          {/* MODAL THÊM / SỬA */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {formMode === "create" ? "Thêm sản phẩm mới" : "Cập nhật sản phẩm"}
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium">Tên sản phẩm</label>
                    <input
                      type="text"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      className="w-full rounded border border-zinc-300 p-2"
                      placeholder="VD: Nhẫn bạc S925…"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Danh mục</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full rounded border border-zinc-300 p-2 bg-white"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      <option value="Nhẫn">Nhẫn</option>
                      <option value="Vòng tay">Vòng tay</option>
                      <option value="Dây chuyền">Dây chuyền</option>
                      <option value="Bông tai">Bông tai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Giá (VND)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full rounded border border-zinc-300 p-2"
                      placeholder="VD: 350000"
                    />
                    <p className="mt-1 text-xs text-zinc-500">Hiển thị: <CurrencyDisplay value={newProduct.price} /></p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Ảnh sản phẩm</label>
                    <div className="mt-2">
                      <input type="file" accept="image/*" onChange={onFileChange} className="w-full text-sm" />
                      <div className="mt-2 flex items-center gap-2">
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} alt="preview" className="h-16 w-16 rounded object-cover border border-zinc-200" />
                            <button type="button" onClick={clearImageSelection} className="text-xs text-zinc-600 underline">Hủy</button>
                          </>
                        ) : newProduct.image ? (
                          <>
                            <img src={newProduct.image} alt="preview" className="h-16 w-16 rounded object-cover border border-zinc-200" />
                            <button type="button" onClick={clearImageSelection} className="text-xs text-zinc-600 underline">Xóa ảnh</button>
                          </>
                        ) : (
                          <div className="text-xs text-zinc-500">Chưa chọn file</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Mô tả</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full rounded border border-zinc-300 p-2"
                      rows={3}
                      placeholder="Mô tả ngắn về sản phẩm…"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={closeAddModal} disabled={submitting} className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50">
                    Hủy
                  </button>
                  <button onClick={handleSubmit} disabled={submitting} className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                    {submitting ? "Đang lưu..." : formMode === "create" ? "Lưu" : "Cập nhật"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
