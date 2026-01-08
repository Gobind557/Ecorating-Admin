import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "../store/productsSlice";
import type { Product } from "../types";
import { useDebounce } from "../hooks/useDebounce";
import { useFilters } from "../hooks/useFilters";
import { useSort } from "../hooks/useSort";
import { usePagination } from "../hooks/usePagination";

export default function Products() {
  const dispatch = useAppDispatch();
  const { items: products, loading } = useAppSelector(
    (state) => state.products
  );

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<
    "Active" | "Inactive" | "All"
  >("All");
  const [sortField, setSortField] = useState<"price" | "updatedAt" | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    // Only fetch from JSON if we don't have persisted data
    // This prevents overwriting rehydrated state from localStorage
    const hasPersisted = localStorage.getItem("reduxState") !== null;

    if (products.length === 0 && !hasPersisted) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = products.map((p) => p.category);
    return Array.from(new Set(cats)).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useFilters(products, {
    search: debouncedSearch,
    category: categoryFilter,
    status: statusFilter,
  });

  // Sort products
  const sortedProducts = useSort(filteredProducts, {
    field: sortField,
    direction: sortDirection,
  });

  // Paginate products
  const {
    currentPage,
    totalPages,
    paginatedData,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination(sortedProducts, 10);

  const handleSort = useCallback(
    (field: "price" | "updatedAt") => {
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setIsCreating(false);
    setShowModal(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingProduct(null);
    setIsCreating(true);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      const product = products.find((p) => p.id === id);
      if (!product) return;

      const isActive = product.status === "Active";
      const message = isActive
        ? "This will deactivate the product. Delete again to permanently remove it."
        : "Are you sure you want to permanently delete this product?";

      if (window.confirm(message)) {
        await dispatch(deleteProduct(id));
      }
    },
    [dispatch, products]
  );

  const handleToggleStatus = useCallback(
    (id: string) => {
      dispatch(toggleProductStatus(id));
    },
    [dispatch]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const productData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string),
        category: formData.get("category") as string,
        status: (formData.get("status") as "Active" | "Inactive") || "Active",
        rating: parseFloat(formData.get("rating") as string),
      };

      // Validation
      if (productData.name.length < 3) {
        alert("Name must be at least 3 characters");
        return;
      }
      if (productData.price <= 0) {
        alert("Price must be greater than 0");
        return;
      }
      if (productData.stock < 0) {
        alert("Stock must be 0 or greater");
        return;
      }
      if (!productData.category) {
        alert("Category is required");
        return;
      }
      if (productData.rating < 1 || productData.rating > 5) {
        alert("Rating must be between 1 and 5");
        return;
      }

      if (isCreating) {
        await dispatch(createProduct(productData));
      } else if (editingProduct) {
        await dispatch(
          updateProduct({ id: editingProduct.id, updates: productData })
        );
      }

      setShowModal(false);
      setEditingProduct(null);
      setIsCreating(false);
    },
    [dispatch, isCreating, editingProduct]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Products
        </h1>
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2 font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Create Product</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "Active" | "Inactive" | "All")
            }
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => handleSort("price")}
              className={`px-4 py-2.5 rounded-lg border transition-all duration-200 font-medium ${
                sortField === "price"
                  ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Sort by Price{" "}
              {sortField === "price" && (sortDirection === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => handleSort("updatedAt")}
              className={`px-4 py-2.5 rounded-lg border transition-all duration-200 font-medium ${
                sortField === "updatedAt"
                  ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Sort by Date{" "}
              {sortField === "updatedAt" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </button>
          </div>
        </div>
      </div>

      {/* Products Table (Desktop) / Cards (Mobile) */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading products...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          product.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.rating}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(product.id)}
                          className="text-yellow-600 hover:text-yellow-800 font-medium px-2 py-1 rounded hover:bg-yellow-50 transition-colors"
                        >
                          Toggle
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {paginatedData.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      product.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {product.description}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="font-medium">Category:</span>{" "}
                    {product.category}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> $
                    {product.price.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Stock:</span> {product.stock}
                  </div>
                  <div>
                    <span className="font-medium">Rating:</span>{" "}
                    {product.rating}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(product.id)}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-sm font-medium"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 bg-white rounded-xl shadow-md border border-gray-100 p-4">
              <button
                onClick={prevPage}
                disabled={!hasPrevPage}
                className="px-5 py-2.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium disabled:hover:bg-transparent"
              >
                Previous
              </button>
              <span className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={!hasNextPage}
                className="px-5 py-2.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all">
            <h2 className="text-2xl font-bold mb-4">
              {isCreating ? "Create Product" : "Edit Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct?.name || ""}
                  required
                  minLength={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description || ""}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0.01"
                    defaultValue={editingProduct?.price || ""}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    defaultValue={editingProduct?.stock || ""}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  defaultValue={editingProduct?.category || ""}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingProduct?.status || "Active"}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    name="rating"
                    min="1"
                    max="5"
                    step="0.1"
                    defaultValue={editingProduct?.rating || 4.0}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    setIsCreating(false);
                  }}
                  className="px-6 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-md hover:shadow-lg transition-all"
                >
                  {isCreating ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
