import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRoute from "../../components/Admin/AdminRoute";
import useAdminData from "../../lib/hooks/useAdminData";

//sắp xếp theo ngày tạo mới nhất
const getTimestamp = (date) => {
	const time = date ? new Date(date).getTime() : 0;
	return Number.isNaN(time) ? 0 : time;
};

export default function Dashboard() {
	const { loading, error, users, products, usersCount, productsCount } = useAdminData();

	//sap xep 5 nguoi dung moi nhat
	const recentUsers = React.useMemo(() => {
		if (!Array.isArray(users)) return [];

		return [...users]
			.sort((a, b) => getTimestamp(b?.createdAt) - getTimestamp(a?.createdAt))
			.slice(0, 5);
	}, [users]);

	//sap xep 5 san pham moi nhat
	const recentProducts = React.useMemo(() => {
		if(!Array.isArray(products)) return [];

		return [...products]
			.sort((a, b) => getTimestamp(b?.createdAt) - getTimestamp(a?.createdAt))
			.slice(0, 5);
	}, [products]);

	return (
		<AdminRoute>
			<AdminLayout>
				<div className="p-6">
					<h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

					{loading ? (
						<div>Đang tải...</div>
					) : error ? (
						<div className="text-red-600">Lỗi: {error}</div>
					) : (
						<>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
								<div className="p-4 bg-white rounded shadow">
									<div className="text-sm text-zinc-500">Người dùng</div>
									<div className="text-3xl font-semibold">{usersCount}</div>
								</div>

								<div className="p-4 bg-white rounded shadow">
									<div className="text-sm text-zinc-500">Sản phẩm</div>
									<div className="text-3xl font-semibold">{productsCount}</div>
								</div>

								<div className="p-4 bg-white rounded shadow">
									<div className="text-sm text-zinc-500">Trạng thái hệ thống</div>
									<div className="text-3xl font-semibold text-green-600">OK</div>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<section className="bg-white rounded shadow p-4">
									<h2 className="font-semibold mb-3">Người dùng mới</h2>
									{recentUsers.length === 0 ? (
										<div>Không có người dùng</div>
									) : (
										<ul className="space-y-2">
											{recentUsers.map((u) => (
												<li key={u._id} className="flex items-center justify-between">
													<div>
														<div className="font-medium">{u.name || u.email}</div>
														<div className="text-sm text-zinc-500">{u.email} • {u.role}</div>
													</div>
												</li>
											))}
										</ul>
									)}
								</section>

								<section className="bg-white rounded shadow p-4">
									<h2 className="font-semibold mb-3">Sản phẩm mới</h2>
									{recentProducts.length === 0 ? (
										<div>Không có sản phẩm</div>
									) : (
										<ul className="space-y-2">
											{recentProducts.map((p) => (
												<li key={p._id} className="flex items-center justify-between">
													<div>
														<div className="font-medium">{p.title}</div>
														<div className="text-sm text-zinc-500">{new Date(p.createdAt).toLocaleString()}</div>
													</div>
													<div className="text-sm text-zinc-500">{p.status}</div>
												</li>
											))}
										</ul>
									)}
								</section>
							</div>
						</>
					)}
				</div>
			</AdminLayout>
		</AdminRoute>
	);
}
