import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRoute from "../../components/Admin/AdminRoute";
import useAdminData from "../../lib/hooks/useAdminData";
import useProductCrud from "../../lib/hooks/useProductCrud";
import CurrencyDisplay from "../../components/Admin/CurrencyDisplay";
import formatDateTime from "../../components/Admin/FormatDateTime";
import useSearchPage from "../../lib/hooks/useSearchPage";
import usePagination from "../../lib/hooks/usePagination";
import Pagination from "../../components/Admin/Pagination";


export default function Products() {
  const { loading, error, products = [], refresh } = useAdminData();
  const { createProduct, updateProduct, deleteProduct, submitting, deletingId } =
    useProductCrud();

  const [showModal, setShowModal] = React.useState(false);
  const [formMode, setFormMode] = React.useState("create");
  const [editingId, setEditingId] = React.useState(null);
  const [newProduct, setNewProduct] = React.useState({
    title: "",
    category: "",
    description: "",
    price: "",
    image: "",
    quantity: "",
  });
  const [imageFile, setImageFile] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState(null);

  React.useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview); // tránh rò rỉ bộ nhớ
    };
  }, [imagePreview]);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  const {
    searchTerm,
    setSearchTerm,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchPage({ debounceMs: 400, minLength: 1 });

  const trimmedSearch = searchTerm.trim();
  const searchActive = Boolean(trimmedSearch);
  const shouldUseSearchResults = searchActive && !searchError;
  const dataSource = shouldUseSearchResults ? searchResults : products;
  const listLoading = shouldUseSearchResults ? searchLoading : loading;
  const listError = shouldUseSearchResults ? searchError : error;

  React.useEffect(() => {
    setPage(1); // luôn đặt lại trang về 1 khi tìm kiếm thay đổi
  }, [trimmedSearch]);

  const { paginated, totalItems, totalPages, offset } = usePagination(
    dataSource,
    page,
    pageSize
  );

  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [pageSize, totalPages, page]);

  const startIndex = offset;
  const totalProducts = products.length;

  const searchStatusText = React.useMemo(() => {
    if (!searchActive) return "";
    if (listLoading) return "Đang tìm kiếm...";
    if (listError) return String(listError);
    if (totalItems === 0) return "Không tìm thấy sản phẩm phù hợp.";
    return `Tìm thấy ${totalItems} sản phẩm phù hợp.`;
  }, [searchActive, listLoading, listError, totalItems]);

  const handleSearchChange = React.useCallback(
    (event) => {
      setSearchTerm(event.target.value);
    },
    [setSearchTerm]
  );

  const refreshWithSearch = React.useCallback(async () => {
    await refresh();
    if (searchActive) {
      await refetchSearch();
    }
  }, [refresh, refetchSearch, searchActive]);

  const openAddModal = () => {
    setFormMode("create");
    setEditingId(null);
    setNewProduct({
      title: "",
      category: "",
      description: "",
      price: "",
      image: "",
      quantity: "",
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

  const handleSubmit = async () => {
    try {
      let productPayload = { ...newProduct };
      productPayload.quantity =
        productPayload.quantity === "" ? 0 : Number(productPayload.quantity);

      if (imageFile) {
        const uploadedUrl = await uploadFileToServer(imageFile);
        if (!uploadedUrl) throw new Error("Không thể tải ảnh lên");
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

      await refreshWithSearch();
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

  const handleDelete = React.useCallback(
    async (product) => {
      if (!product?._id) return;
      const confirmed = window.confirm(
        `Bạn chắc chắn muốn xóa "${product.title || "sản phẩm"}"?`
      );
      if (!confirmed) return;
      try {
        await deleteProduct(product._id);
        await refreshWithSearch();
      } catch (err) {
        console.error("Delete product failed", err);
        window.alert(err?.response?.data?.message || "Xóa sản phẩm thất bại");
      }
    },
    [deleteProduct, refreshWithSearch]
  );

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
        quantity:
          product.quantity === null || product.quantity === undefined
            ? ""
            : String(product.quantity),
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
          {/* Khởi header + toolbar với style bạn yêu cầu */}
          <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <ProductHeader
              onAdd={openAddModal}
              onRefresh={refreshWithSearch}
              refreshing={loading}
            />
            <ProductToolbar
              totalProducts={totalProducts}
              paginationProps={{
                page,
                setPage,
                pageSize,
                setPageSize,
                totalPages,
                totalItems,
                offset,
              }}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              searchStatus={searchStatusText}
              searchActive={searchActive}
            />
          </div>

          {/* Bảng sản phẩm */}
          <ProductTable
            items={paginated}
            startIndex={startIndex}
            onEdit={handleUpdate}
            onDelete={handleDelete}
            deletingId={deletingId}
            loading={listLoading}
            error={listError}
            searchActive={searchActive}
            totalItems={totalItems}
          />
        </div>

        {/* Modal thêm/sửa sản phẩm */}
        <ProductModal
          visible={showModal}
          formMode={formMode}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          imagePreview={imagePreview}
          onFileChange={onFileChange}
          onClearImage={clearImageSelection}
          onClose={closeAddModal}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </AdminLayout>
    </AdminRoute>

  );
}

function ProductHeader({ onAdd, onRefresh, refreshing }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Quản lý sản phẩm</h1>
        <p className="text-sm text-zinc-500">
          Thêm, sửa, xóa và quản lý sản phẩm trong cửa hàng của bạn.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="rounded border border-green-500 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50"
        >
          Thêm sản phẩm
        </button>
        <button
          type="button"
          onClick={() => onRefresh()}
          disabled={refreshing}
          className="inline-flex items-center rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Làm mới
        </button>
      </div>
    </div>
  );
}

function ProductToolbar({
  totalProducts,
  paginationProps,
  searchTerm,
  onSearchChange,
  searchStatus,
  searchActive,
}) {
  const { page, setPage, pageSize, setPageSize, totalPages, totalItems, offset } =
    paginationProps;

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Tổng số sản phẩm: <strong>{totalProducts}</strong>
        </span>
        <div className="flex flex-1 items-center justify-start gap-2 sm:ml-35">
          <input
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Tìm sản phẩm..."
            className="w-full sm:w-64 rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-0"
          />
          {searchActive && searchStatus ? (
            <span className="text-xs text-zinc-500">{searchStatus}</span>
          ) : null}
        </div>
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
  );
}

function ProductTable({
  items,
  startIndex,
  onEdit,
  onDelete,
  deletingId,
  loading,
  error,
  searchActive,
  totalItems,
}) {
  if (loading) {
    return <div>Đang tải danh sách sản phẩm...</div>;
  }

  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
        Loi: {error}
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="rounded border border-zinc-200 bg-white p-6 text-center text-zinc-600">
        {searchActive ? "Không tìm thấy sản phẩm phù hợp." : "Hiện chưa có sản phẩm nào."}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-zinc-200 bg-white shadow-sm">
      <table className="min-w-full table-fixed divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-100 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
          <tr>
            <th className="w-12 text-center px-2 py-3">STT</th>
            <th className="w-20 text-center px-2 py-3">Ảnh</th>
            <th className="w-36 text-center px-2 py-3">Sản phẩm</th>
            <th className="w-36 text-center px-2 py-3">Danh mục</th>
            <th className="w-28 text-center px-2 py-3">Đơn giá</th>
            <th className="w-20 text-center px-2 py-3">Tồn kho</th>
            <th className="w-[300px] text-center px-2 py-3">Mô tả</th>
            <th className="w-44 text-center px-2 py-3">Ngày tạo</th>
            <th className="w-24 text-center px-2 py-3">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {items.map((product, idx) => (
            <tr key={product._id || idx} className="hover:bg-zinc-50">
              <td className="px-4 py-3 text-center">{startIndex + idx + 1}</td>
              <td className="px-4 py-3 text-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title || "?nh s?n ph?m"}
                    className="mx-auto h-12 w-12 rounded border border-zinc-200 object-cover"
                  />
                ) : (
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded bg-zinc-100 text-xs text-zinc-400">
                    Trống
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-center font-medium text-zinc-900">
                {product.title || "Không tên"}
              </td>
              <td className="px-4 py-3 text-center text-zinc-600">
                {product.category?.name || product.category || "-"}
              </td>
              <td className="px-4 py-3 text-center text-zinc-600">
                <CurrencyDisplay value={product.price} />
              </td>
              <td className="px-4 py-3 text-center text-zinc-600">{product.quantity ?? 0}</td>
              <td className="max-w-[300px] px-4 py-3 text-center text-zinc-600 truncate">
                {product.description || "-"}
              </td>
              <td className="px-4 py-3 text-center text-zinc-600">
                {formatDateTime(product.createdAt)}
              </td>
              <td className="px-2 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="rounded border border-blue-500 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
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
  );
}

function ProductModal({
  visible,
  formMode,
  newProduct,
  setNewProduct,
  imagePreview,
  onFileChange,
  onClearImage,
  onClose,
  onSubmit,
  submitting,
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Danh mục</label>
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="w-full rounded border border-zinc-300 bg-white p-2"
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
            />
            <p className="mt-1 text-xs text-zinc-500">Hiển thị: <CurrencyDisplay value={newProduct.price} /></p>
          </div>
          <div>
            <label className="block text-sm font-medium">Số lượng tồn kho</label>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
              className="w-full rounded border border-zinc-300 p-2"
              placeholder="Nhap so luong (VD: 10)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Ảnh sản phẩm</label>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
              id="file-upload"
            />
            <div className="mt-2 flex items-center gap-2">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="h-16 w-16 rounded border border-zinc-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={onClearImage}
                    className="text-xs text-zinc-600 underline"
                  >
                    Hủy
                  </button>
                </>
              ) : newProduct.image ? (
                <>
                  <img
                    src={newProduct.image}
                    alt="preview"
                    className="h-16 w-16 rounded border border-zinc-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={onClearImage}
                    className="text-xs text-zinc-600 underline"
                  >
                    Xóa ảnh
                  </button>
                </>
              ) : (
                <label
                  htmlFor="file-upload"
                  className="flex h-16 w-16 cursor-pointer items-center justify-center rounded border border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6 text-zinc-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Mô tả</label>
            <textarea
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full rounded border border-zinc-300 p-2"
              rows={3}
              placeholder="Mô tả ngắn về sản phẩm."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? "Đang lưu..." : formMode === "create" ? "ưu" : "Cập nhật"}
          </button>
        </div>
      </div>
    </div>
  );
}




