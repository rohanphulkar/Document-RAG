import React from "react";
import { Skeleton } from "./ui/skeleton";

export const CardSkeleton = () => (
  <div className="bg-card rounded-2xl border p-6 shadow-lg">
    <div className="flex items-start gap-4 mb-4">
      <Skeleton className="h-14 w-14 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <div className="pt-4 border-t">
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    ))}
  </div>
);

export const ChatListSkeleton = () => (
  <div className="p-2 space-y-2">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const MessageSkeleton = () => (
  <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6">
    <div className="max-w-3xl mx-auto space-y-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`flex gap-3 ${
            i % 2 === 0 ? "flex-row" : "flex-row-reverse"
          }`}
        >
          <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
          <div
            className={`flex flex-col gap-2 max-w-[70%] ${
              i % 2 === 0 ? "items-start" : "items-end"
            }`}
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton
              className={`h-20 ${i % 2 === 0 ? "w-64" : "w-48"} rounded-2xl`}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PageSkeleton = () => (
  <div className="min-h-screen bg-background p-4 md:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);
