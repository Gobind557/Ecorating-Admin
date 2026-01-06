import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts, createProduct, updateProduct, deleteProduct, toggleProductStatus } from '../store/productsSlice';
import type { Product } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { useFilters } from '../hooks/useFilters';
import { useSort } from '../hooks/useSort';
import { usePagination } from '../hooks/usePagination';

export default function Products() {
  const dispatch = useAppDispatch();
  const { items: products, loading } = useAppSelector((state) => state.products);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Inactive' | 'All'>('All');
  const [sortField, setSortField] = useState<'price' | 'updatedAt' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = products.map(p => p.category);
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

  const handleSort = useCallback((field: 'price' | 'updatedAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

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

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await dispatch(deleteProduct(id));
    }
  }, [dispatch]);

  const handleToggleStatus = useCallback((id: string) => {
    dispatch(toggleProductStatus(id));
  }, [dispatch]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      category: formData.get('category') as string,
      status: (formData.get('status') as 'Active' | 'Inactive') || 'Active',
      rating: parseFloat(formData.get('rating') as string),
    };

    // Validation
    if (productData.name.length < 3) {
      alert('Name must be at least 3 characters');
      return;
    }
    if (productData.price <= 0) {
      alert('Price must be greater than 0');
      return;
    }
    if (productData.stock < 0) {
      alert('Stock must be 0 or greater');
      return;
    }
    if (!productData.category) {
      alert('Category is required');
      return;
    }
    if (productData.rating < 1 || productData.rating > 5) {
      alert('Rating must be between 1 and 5');
      return;
    }

    if (isCreating) {
      await dispatch(createProduct(productData));
    } else if (editingProduct) {
      await dispatch(updateProduct({ id: editingProduct.id, updates: productData }));
    }

    setShowModal(false);
    setEditingProduct(null);
    setIsCreating(false);
  }, [dispatch, isCreating, editingProduct]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Create Product
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'Active' | 'Inactive' | 'All')}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => handleSort('price')}
              className={`px-4 py-2 rounded-lg border transition ${
                sortField === 'price' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
              }`}
            >
              Sort by Price {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('updatedAt')}
              className={`px-4 py-2 rounded-lg border transition ${
                sortField === 'updatedAt' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
              }`}
            >
              Sort by Date {sortField === 'updatedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Products Table (Desktop) / Cards (Mobile) */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.rating}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(product.id)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          Toggle
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
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
              <div key={product.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div><span className="font-medium">Category:</span> {product.category}</div>
                  <div><span className="font-medium">Price:</span> ${product.price.toFixed(2)}</div>
                  <div><span className="font-medium">Stock:</span> {product.stock}</div>
                  <div><span className="font-medium">Rating:</span> {product.rating}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(product.id)}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={prevPage}
                disabled={!hasPrevPage}
                className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={!hasNextPage}
                className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-4">
              {isCreating ? 'Create Product' : 'Edit Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct?.name || ''}
                  required
                  minLength={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description || ''}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price *</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0.01"
                    defaultValue={editingProduct?.price || ''}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    defaultValue={editingProduct?.stock || ''}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  name="category"
                  defaultValue={editingProduct?.category || ''}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingProduct?.status || 'Active'}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    name="rating"
                    min="1"
                    max="5"
                    step="0.1"
                    defaultValue={editingProduct?.rating || 4.0}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isCreating ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

