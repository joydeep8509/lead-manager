'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { DeleteModal } from '@/components/DeleteModal';
import { LeadModal } from '@/components/LeadModal';
import { LeadsTable, ViewMode } from '@/components/LeadsTable';
import { Sidebar } from '@/components/Sidebar';
import { StatsCards } from '@/components/StatsCards';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { Topbar } from '@/components/Topbar';
import { useAuth } from '@/context/AuthContext';
import { ApiError, api } from '@/lib/api';
import {
  Lead,
  LeadFormValues,
  LeadSource,
  LeadStats,
  LeadStatus,
  PaginationMeta,
  SortField,
  SortOrder,
} from '@/types/lead';

const INITIAL_STATS: LeadStats = {
  total: 0,
  byStatus: { New: 0, Contacted: 0, Qualified: 0, Lost: 0 },
};

const INITIAL_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>(INITIAL_STATS);
  const [pagination, setPagination] =
    useState<PaginationMeta>(INITIAL_PAGINATION);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const addToast = useCallback((type: ToastMessage['type'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // Default to card grid on small screens for optimal mobile UX
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErrorBanner(null);

    try {
      const [leadsRes, statsRes] = await Promise.all([
        api.leads.list({
          search: debouncedSearch,
          status: statusFilter,
          source: sourceFilter,
          sortBy,
          sortOrder,
          page,
          limit: 10,
        }),
        api.leads.stats(),
      ]);

      setLeads(leadsRes.data);
      setPagination(leadsRes.pagination);
      setStats(statsRes);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace('/login');
        return;
      }
      setErrorBanner(
        err instanceof Error
          ? err.message
          : 'Failed to load leads. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    user,
    debouncedSearch,
    statusFilter,
    sourceFilter,
    sortBy,
    sortOrder,
    page,
    logout,
    router,
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    statusFilter !== 'All' ||
    sourceFilter !== 'All';

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStatusFilter('All');
    setSourceFilter('All');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  const handleStatusFilterChange = (status: LeadStatus | 'All') => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSourceFilterChange = (source: LeadSource | 'All') => {
    setSourceFilter(source);
    setPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleOpenCreate = () => {
    setEditingLead(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setModalOpen(true);
  };

  const handleSaveLead = async (values: LeadFormValues) => {
    if (editingLead) {
      await api.leads.update(editingLead.id, values);
      addToast('success', `Updated ${values.name}`);
    } else {
      await api.leads.create(values);
      addToast('success', `Added ${values.name} to pipeline`);
    }
    await fetchDashboardData();
  };

  const handleQuickStatusChange = async (lead: Lead, status: LeadStatus) => {
    if (lead.status === status) return;
    setErrorBanner(null);
    try {
      await api.leads.update(lead.id, { status });
      addToast('success', `${lead.name} moved to ${status}`);
      await fetchDashboardData();
    } catch (err) {
      addToast(
        'error',
        err instanceof Error ? err.message : 'Failed to update lead status.'
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLead) return;
    const deletedName = deletingLead.name;
    setIsDeleting(true);
    setErrorBanner(null);
    try {
      await api.leads.delete(deletingLead.id);
      setDeletingLead(null);
      addToast('success', `Deleted ${deletedName}`);
      if (leads.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchDashboardData();
      }
    } catch (err) {
      addToast(
        'error',
        err instanceof Error ? err.message : 'Failed to delete lead.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-[#0b0d0e] dark:text-zinc-400">
        Loading workspace...
      </div>
    );
  }

  const pageTitle =
    statusFilter === 'All' ? 'All Leads' : `${statusFilter} Leads`;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b0d0e]">
      <Sidebar
        user={user}
        stats={stats}
        activeStatus={statusFilter}
        activeSource={sourceFilter}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onSelectStatus={handleStatusFilterChange}
        onSelectSource={handleSourceFilterChange}
        onLogout={() => {
          logout();
          router.replace('/login');
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          searchValue={searchInput}
          hasActiveFilters={hasActiveFilters}
          isRefreshing={loading}
          onSearchChange={setSearchInput}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNewLead={handleOpenCreate}
          onResetFilters={handleResetFilters}
          onRefresh={fetchDashboardData}
        />

        <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Page Header & Primary CTA */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {pageTitle}
              </h1>
              <nav
                aria-label="Breadcrumb"
                className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-500"
              >
                <span>Dashboard</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-medium text-slate-700 dark:text-zinc-300">
                  {pageTitle}
                </span>
                {sourceFilter !== 'All' && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="font-medium text-[#65c146]">
                      {sourceFilter}
                    </span>
                  </>
                )}
              </nav>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#65c146] px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-md shadow-[#65c146]/20 transition hover:bg-[#54ad36]"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Add Lead
            </motion.button>
          </div>

          {/* KPI Stat Cards */}
          <StatsCards
            stats={stats}
            activeStatus={statusFilter}
            onSelectStatus={handleStatusFilterChange}
          />

          {/* Error Banner */}
          {errorBanner && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
            >
              <span>{errorBanner}</span>
              <button
                type="button"
                onClick={fetchDashboardData}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-300 bg-white px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/25"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          )}

          {/* Leads Data Panel */}
          <LeadsTable
            leads={leads}
            loading={loading}
            viewMode={viewMode}
            searchInput={searchInput}
            statusFilter={statusFilter}
            sourceFilter={sourceFilter}
            pagination={pagination}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onViewModeChange={setViewMode}
            onSearchChange={setSearchInput}
            onStatusFilterChange={handleStatusFilterChange}
            onSourceFilterChange={handleSourceFilterChange}
            onSort={handleSort}
            onPageChange={setPage}
            onEdit={handleOpenEdit}
            onDelete={setDeletingLead}
            onQuickStatusChange={handleQuickStatusChange}
          />
        </main>
      </div>

      <LeadModal
        isOpen={modalOpen}
        initialLead={editingLead}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveLead}
      />

      <DeleteModal
        lead={deletingLead}
        deleting={isDeleting}
        onCancel={() => setDeletingLead(null)}
        onConfirm={handleConfirmDelete}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
