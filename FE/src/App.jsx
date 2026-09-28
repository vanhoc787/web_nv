import { useState } from 'react'
import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/Admin/AdminLayout/AdminLayout"
import UserManagement from "./components/Admin/UserManagement/UserManagement"
import AuthGuard from "./components/AuthGuard/AuthGuard";
import Loans from "./components/Loan/Loan";
import Report from "./components/Report/Report";
import FormGenerator from "./components/FormGenerator/FormGenerator";
import Login from "./components/Login/Login";
import Layout from "./components/Layout/Layout";
import './App.css'

import './index.css'
import './styles/websocket.css';

function App() {

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
            <Route path="/" element={
                <AuthGuard requireAuth={false}>
                    <Navigate to="/login" replace />
                </AuthGuard>
            } />

            <Route path="/login" element={
                <AuthGuard requireAuth={false}>
                    <Login />
                </AuthGuard>
            } />

            <Route
                path="/admin"
                element={
                    <AuthGuard>
                        <AdminLayout>
                            <UserManagement />
                        </AdminLayout>
                    </AuthGuard>
                }
            />

            <Route path="/loans" element={
                <Layout>
                    <Loans />
                </Layout>
            } />

            <Route path="/createWord" element={
                <Layout>
                    <FormGenerator />
                </Layout>
            } />

            <Route path="/reports" element={
                <Layout>
                    <Report />
                </Layout>
            } />
        </Routes>
    </>
  )
}

export default App
