import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import UsersList from './views/users/UsersList';
import UserForm from './views/users/UserForm';
import CategoriesList from './views/categories/CategoriesList';
import CategoryForm from './views/categories/CategoryForm';
import TagsList from './views/tags/TagsList';
import TagForm from './views/tags/TagForm';
import ArticlesList from './views/articles/ArticlesList';
import ArticleForm from './views/articles/ArticleForm';
import ArticlesPublicList from './views/articles/ArticlesPublicList';
import ArticlePublicView from './views/articles/ArticlePublicView';
import ProductsList from './views/products/ProductsList';
import ProductForm from './views/products/ProductForm';
import ProductCategoriesList from './views/product-categories/CategoriesList';
import ProductCategoryForm from './views/product-categories/CategoryForm';
import ProductTagsList from './views/product-tags/TagsList';
import ProductTagForm from './views/product-tags/TagForm';
import ProductColorsList from './views/product-colors/ProductColorsList';
import ProductColorForm from './views/product-colors/ProductColorForm';
import ProductSizesList from './views/product-sizes/ProductSizesList';
import ProductSizeForm from './views/product-sizes/ProductSizeForm';
import CouponsList from './views/coupons/CouponList';
import CouponForm from './views/coupons/CouponForm';
import AutopostGenerator from './views/autopost/AutopostGenerator';
import AutopostSettings from './views/autopost/AutopostSettings';
import ProductsShow from './views/products/ProductsShow';
import SettingsList from './views/settings/SettingsList';
import BusinessInfoSettings from './views/settings/BusinessInfoSettings';
import ImageSettings from './views/settings/ImageSettings';
import BlogSettings from './views/settings/BlogSettings';
import ProductSettings from './views/settings/ProductSettings';
import SystemConfigurations from './views/settings/SystemConfigurations';
import RolesList from './views/roles/RolesList';

import RoleForm from './views/roles/RoleForm';
import PermissionsList from './views/permissions/PermissionsList';
import PermissionForm from './views/permissions/PermissionForm';
import Profile from './views/Profile';
import ActivityLogsList from './views/activity-logs/ActivityLogsList';
import CustomersList from './views/customers/CustomersList';
import CustomerForm from './views/customers/CustomerForm';
import ContactMessagesList from './views/contact-messages/ContactMessagesList';
import DashboardLayout from './components/dashboard-layout';
import { hasPermission, isSuperAdmin } from './components/can';

const ProtectedRoute = ({ children, permission, superAdminOnly }) => {
  const isAuthenticated = !!localStorage.getItem('ACCESS_TOKEN');
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (superAdminOnly && !isSuperAdmin()) return <Navigate to="/dashboard" />;
  if (permission && !hasPermission(permission)) return <Navigate to="/dashboard" />;
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

function App() {
  const isAuthenticated = !!localStorage.getItem('ACCESS_TOKEN');

  return (
    <Router>
      <Routes>
<Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        
        <Route path="/blog" element={<ArticlesPublicList />} />
        <Route path="/articles/:slug" element={<ArticlePublicView />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute permission="view users">
            <UsersList />
          </ProtectedRoute>
        } />

        <Route path="/users/create" element={
          <ProtectedRoute permission="create users">
            <UserForm />
          </ProtectedRoute>
        } />

        <Route path="/users/edit/:id" element={
          <ProtectedRoute permission="edit users">
            <UserForm />
          </ProtectedRoute>
        } />

        <Route path="/categories" element={
          <ProtectedRoute permission="view categories">
            <CategoriesList />
          </ProtectedRoute>
        } />

        <Route path="/categories/create" element={
          <ProtectedRoute permission="manage categories">
            <CategoryForm />
          </ProtectedRoute>
        } />

        <Route path="/categories/edit/:id" element={
          <ProtectedRoute permission="manage categories">
            <CategoryForm />
          </ProtectedRoute>
        } />

        <Route path="/articles" element={
          <ProtectedRoute permission="view articles">
            <ArticlesList />
          </ProtectedRoute>
        } />

        <Route path="/articles/create" element={
          <ProtectedRoute permission="manage articles">
            <ArticleForm />
          </ProtectedRoute>
        } />

        <Route path="/articles/edit/:id" element={
          <ProtectedRoute permission="manage articles">
            <ArticleForm />
          </ProtectedRoute>
        } />

        <Route path="/tags" element={
          <ProtectedRoute permission="view tags">
            <TagsList />
          </ProtectedRoute>
        } />

        <Route path="/tags/create" element={
          <ProtectedRoute permission="manage tags">
            <TagForm />
          </ProtectedRoute>
        } />

        <Route path="/tags/edit/:id" element={
          <ProtectedRoute permission="manage tags">
            <TagForm />
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute permission="view products">
            <ProductsList />
          </ProtectedRoute>
        } />

        <Route path="/products/create" element={
          <ProtectedRoute permission="manage products">
            <ProductForm />
          </ProtectedRoute>
        } />

        <Route path="/products/edit/:id" element={
          <ProtectedRoute permission="manage products">
            <ProductForm />
          </ProtectedRoute>
        } />

        <Route path="/products/:id" element={
          <ProtectedRoute permission="view products">
            <ProductsShow />
          </ProtectedRoute>
        } />

        <Route path="/product-categories" element={
          <ProtectedRoute permission="view product categories">
            <ProductCategoriesList />
          </ProtectedRoute>
        } />

        <Route path="/product-categories/create" element={
          <ProtectedRoute permission="manage product categories">
            <ProductCategoryForm />
          </ProtectedRoute>
        } />

        <Route path="/product-categories/edit/:id" element={
          <ProtectedRoute permission="manage product categories">
            <ProductCategoryForm />
          </ProtectedRoute>
        } />

        <Route path="/product-tags" element={
          <ProtectedRoute permission="view product tags">
            <ProductTagsList />
          </ProtectedRoute>
        } />

        <Route path="/product-tags/create" element={
          <ProtectedRoute permission="manage product tags">
            <ProductTagForm />
          </ProtectedRoute>
        } />

        <Route path="/product-tags/edit/:id" element={
          <ProtectedRoute permission="manage product tags">
            <ProductTagForm />
          </ProtectedRoute>
        } />

        <Route path="/roles" element={

          <ProtectedRoute permission="view roles">
            <RolesList />
          </ProtectedRoute>
        } />

        <Route path="/roles/create" element={
          <ProtectedRoute permission="create roles">
            <RoleForm />
          </ProtectedRoute>
        } />

        <Route path="/roles/edit/:id" element={
          <ProtectedRoute permission="edit roles">
            <RoleForm />
          </ProtectedRoute>
        } />

        <Route path="/permissions" element={
          <ProtectedRoute permission="view permissions">
            <PermissionsList />
          </ProtectedRoute>
        } />

        <Route path="/permissions/create" element={
          <ProtectedRoute permission="create permissions">
            <PermissionForm />
          </ProtectedRoute>
        } />

        <Route path="/permissions/edit/:id" element={
          <ProtectedRoute permission="edit permissions">
            <PermissionForm />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/activity-logs" element={
          <ProtectedRoute permission="view activity logs">
            <ActivityLogsList />
          </ProtectedRoute>
        } />

        <Route path="/customers" element={
          <ProtectedRoute permission="manage customers">
            <CustomersList />
          </ProtectedRoute>
        } />

        <Route path="/customers/create" element={
          <ProtectedRoute permission="manage customers">
            <CustomerForm />
          </ProtectedRoute>
        } />

        <Route path="/customers/edit/:id" element={
          <ProtectedRoute permission="manage customers">
            <CustomerForm />
          </ProtectedRoute>
        } />

        <Route path="/contact-messages" element={
          <ProtectedRoute permission="view blog">
            <ContactMessagesList />
          </ProtectedRoute>
        } />

        <Route path="/autopost" element={
          <ProtectedRoute permission="manage articles">
            <AutopostGenerator />
          </ProtectedRoute>
        } />

        <Route path="/autopost-settings" element={
          <ProtectedRoute permission="manage articles">
            <AutopostSettings />
          </ProtectedRoute>
        } />

        <Route path="/product-colors" element={
          <ProtectedRoute permission="view product colors">
            <ProductColorsList />
          </ProtectedRoute>
        } />

        <Route path="/product-colors/create" element={
          <ProtectedRoute permission="manage product colors">
            <ProductColorForm />
          </ProtectedRoute>
        } />

        <Route path="/product-colors/edit/:id" element={
          <ProtectedRoute permission="manage product colors">
            <ProductColorForm />
          </ProtectedRoute>
        } />

        <Route path="/product-sizes" element={
          <ProtectedRoute permission="view product sizes">
            <ProductSizesList />
          </ProtectedRoute>
        } />

        <Route path="/product-sizes/create" element={
          <ProtectedRoute permission="manage product sizes">
            <ProductSizeForm />
          </ProtectedRoute>
        } />

        <Route path="/product-sizes/edit/:id" element={
          <ProtectedRoute permission="manage product sizes">
            <ProductSizeForm />
          </ProtectedRoute>
        } />

        <Route path="/coupons" element={
          <ProtectedRoute permission="view coupons">
            <CouponsList />
          </ProtectedRoute>
        } />

        <Route path="/coupons/create" element={
          <ProtectedRoute permission="manage coupons">
            <CouponForm />
          </ProtectedRoute>
        } />

        <Route path="/coupons/edit/:id" element={
          <ProtectedRoute permission="manage coupons">
            <CouponForm />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsList />
          </ProtectedRoute>
        } />

        <Route path="/business-info" element={
          <ProtectedRoute>
            <BusinessInfoSettings />
          </ProtectedRoute>
        } />

        <Route path="/image-settings" element={
          <ProtectedRoute permission="manage articles">
            <ImageSettings />
          </ProtectedRoute>
        } />

        <Route path="/blog-settings" element={
          <ProtectedRoute permission="view blog">
            <BlogSettings />
          </ProtectedRoute>
        } />

        <Route path="/product-settings" element={
          <ProtectedRoute permission="view products">
            <ProductSettings />
          </ProtectedRoute>
        } />

        <Route path="/system-configurations" element={
          <ProtectedRoute superAdminOnly={true}>
            <SystemConfigurations />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
