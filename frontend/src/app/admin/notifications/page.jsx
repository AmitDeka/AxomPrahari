"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BellIcon,
  CheckCheckIcon,
  ShieldAlertIcon,
  SettingsIcon,
  AlertTriangleIcon,
  InfoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Trash2Icon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async (targetPage, showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const res = await api.get(`/admin/notifications?page=${targetPage}&limit=${limit}`);
      if (res.data?.status === "success") {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
        
        // Count total pages (since backend may not return totalCount, let's assume if we get fewer than limit, there are no more pages)
        const items = res.data.data.notifications || [];
        if (items.length < limit && targetPage === 1) {
          setTotalPages(1);
        } else if (items.length === limit) {
          // If we got exactly the limit, there might be a next page
          setTotalPages(targetPage + 1);
        } else {
          // Got less than limit on a page > 1
          setTotalPages(targetPage);
        }
      }
    } catch (err) {
      console.error("Error loading notifications", err);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    Promise.resolve().then(() => fetchNotifications(1, false));
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.patch(`/admin/notifications/${id}/read`);
      if (res.data?.status === "success") {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success("Marked as read");
      }
    } catch (err) {
      console.error("Error marking notification as read", err);
      toast.error("Failed to update status.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await api.post("/admin/notifications/mark-all-read");
      if (res.data?.status === "success") {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast.success(res.data.message || "All notifications marked as read.");
      }
    } catch (err) {
      console.error("Error marking all as read", err);
      toast.error("Failed to update notifications.");
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_report":
        return <ShieldAlertIcon className="h-5 w-5 text-emerald-500" />;
      case "settings_change":
        return <SettingsIcon className="h-5 w-5 text-blue-500" />;
      case "system_alert":
        return <AlertTriangleIcon className="h-5 w-5 text-amber-500" />;
      default:
        return <InfoIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationStyles = (n) => {
    if (n.is_read) {
      return "bg-background border-muted/40 opacity-75 hover:opacity-100";
    }
    switch (n.type) {
      case "new_report":
        return "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 shadow-xs";
      case "settings_change":
        return "bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10 shadow-xs";
      case "system_alert":
        return "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 shadow-xs";
      default:
        return "bg-muted/10 border-muted hover:bg-muted/20 shadow-xs";
    }
  };

  const getBadgeVariant = (type) => {
    switch (type) {
      case "new_report":
        return "default"; // emerald-like
      case "settings_change":
        return "secondary"; // blue-like
      case "system_alert":
        return "destructive"; // amber/red
      default:
        return "outline";
    }
  };

  const getBadgeLabel = (type) => {
    switch (type) {
      case "new_report":
        return "New Incident";
      case "settings_change":
        return "Configuration";
      case "system_alert":
        return "System Alert";
      default:
        return "Notification";
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const prev = page - 1;
      setPage(prev);
      fetchNotifications(prev, true);
    }
  };

  const handleNextPage = () => {
    const next = page + 1;
    setPage(next);
    fetchNotifications(next, true);
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Top Header Panel */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 bg-background">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <span className="text-muted-foreground font-medium">Console</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-foreground">Notifications</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              Notification Inbox
              {unreadCount > 0 && (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs font-semibold px-2.5 py-0.5">
                  {unreadCount} New
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground text-sm mt-1 font-medium">
              Monitor, track, and acknowledge critical administrative changes and citizen incident reports.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              size="sm"
              className="border-border hover:bg-muted text-foreground flex items-center gap-2 font-medium"
            >
              <CheckCheckIcon className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <Separator className="bg-border/60" />

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 border rounded-xl p-5 bg-background">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/6" />
                </div>
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed rounded-2xl p-12 bg-background/30 text-center min-h-[300px]">
              <div className="bg-muted/40 p-4 rounded-full mb-4">
                <BellIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Inbox is empty</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1 font-medium">
                You are all caught up! When new incidents are reported or configurations change, they will show up here.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                  className={`flex flex-col sm:flex-row gap-4 border rounded-xl p-5 transition-all cursor-pointer ${getNotificationStyles(
                    n
                  )}`}
                >
                  {/* Left Icon */}
                  <div className="flex items-start shrink-0">
                    <div className="bg-background/80 dark:bg-muted/30 p-2.5 rounded-xl border border-border shadow-2xs">
                      {getNotificationIcon(n.type)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="font-semibold text-[10px] uppercase tracking-wider" variant={getBadgeVariant(n.type)}>
                        {getBadgeLabel(n.type)}
                      </Badge>
                      {n.jurisdiction_district && (
                        <Badge variant="outline" className="text-[10px] border-border text-muted-foreground font-semibold">
                          District: {n.jurisdiction_district}
                        </Badge>
                      )}
                      {!n.is_read && (
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse ml-auto sm:ml-0" />
                      )}
                    </div>
                    <h4 className="text-base font-bold text-foreground mt-1.5">{n.title}</h4>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed mt-0.5">
                      {n.message}
                    </p>
                    <div className="text-xs text-muted-foreground/80 font-medium pt-1.5 flex items-center gap-2">
                      <span>{formatTime(n.created_at)}</span>
                    </div>
                  </div>

                  {/* Mark as Read Button */}
                  {!n.is_read && (
                    <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid double click trigger
                          handleMarkAsRead(n.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold"
                      >
                        Acknowledge
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Section */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between border rounded-xl p-4 bg-background shadow-2xs">
            <span className="text-xs text-muted-foreground font-semibold">
              Page {page}
            </span>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrevPage}
                disabled={page === 1 || loading}
                variant="outline"
                size="sm"
                className="h-8 border-border text-foreground text-xs font-medium"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={handleNextPage}
                disabled={notifications.length < limit || loading}
                variant="outline"
                size="sm"
                className="h-8 border-border text-foreground text-xs font-medium"
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
