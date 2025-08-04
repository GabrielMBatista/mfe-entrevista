"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    containerRef.current?.scrollBy({ left: -150, behavior: "smooth" });
  };

  const scrollRight = () => {
    containerRef.current?.scrollBy({ left: 150, behavior: "smooth" });
  };

  return (
    <div className="relative w-full flex items-center justify-center">
      {/* Botão Esquerda */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-white/90 dark:from-slate-900/90 to-transparent flex items-center justify-center rounded-l-md md:hidden"
      >
        <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
      </button>

      {/* Lista de Abas Scrollável */}
      <TabsPrimitive.List
        ref={containerRef}
        data-slot="tabs-list"
        className={cn(
          "scroll-smooth flex overflow-x-hidden md:overflow-x-auto w-[95%] md:w-full scrollbar-hide bg-muted text-muted-foreground h-9 items-center justify-start rounded-md gap-1 relative mask-fade-l-r px-8 md:px-0",
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>

      {/* Botão Direita */}
      <button
        onClick={scrollRight}
        className="absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-white/90 dark:from-slate-900/90 to-transparent flex items-center justify-center rounded-r-md md:hidden"
      >
        <ChevronRight
          size={20}
          className="text-slate-600 dark:text-slate-300"
        />
      </button>
    </div>
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
