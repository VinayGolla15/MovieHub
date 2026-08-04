"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        let bgColor = "bg-slate-800 text-white";
        let icon = <Info className="h-5 w-5 text-blue-400" />;

        if (toast.type === "success") {
          bgColor = "bg-emerald-950 text-emerald-50 border border-emerald-800";
          icon = <CheckCircle className="h-5 w-5 text-emerald-400" />;
        } else if (toast.type === "error") {
          bgColor = "bg-rose-950 text-rose-50 border border-rose-800";
          icon = <AlertCircle className="h-5 w-5 text-rose-400" />;
        } else if (toast.type === "info") {
          bgColor = "bg-blue-950 text-blue-50 border border-blue-800";
          icon = <Info className="h-5 w-5 text-blue-400" />;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start justify-between p-4 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-in ${bgColor}`}
          >
            <div className="flex gap-3">
              <div className="mt-0.5">{icon}</div>
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
