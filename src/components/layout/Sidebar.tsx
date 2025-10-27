"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, FileText, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: "Standard",
    icon: <FileText className="h-4 w-4" />,
    children: [
      {
        title: "Assessment",
        children: [
          {
            title: "My Assessment",
            children: [
              {
                title: "Menu Item",
                href: "/assessment/my/menu",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Settings",
    icon: <Settings className="h-4 w-4" />,
    href: "/settings",
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "Standard",
    "Assessment",
    "My Assessment",
  ]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const isActive = item.href && pathname === item.href;

    return (
      <div key={item.title} className="w-full">
        {hasChildren ? (
          <>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-left font-normal h-9",
                level === 0 && "font-medium",
                isExpanded && level === 0 && "bg-accent"
              )}
              style={{ paddingLeft: `${level * 16 + 12}px` }}
              onClick={() => toggleExpand(item.title)}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              <span className="flex-1">{item.title}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {isExpanded && item.children && (
              <div className="space-y-1 mt-1">
                {item.children.map((child) => renderMenuItem(child, level + 1))}
              </div>
            )}
          </>
        ) : (
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal h-9",
              isActive && "bg-accent font-medium"
            )}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
            asChild
          >
            <Link href={item.href || "#"}>
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.title}
            </Link>
          </Button>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn("flex h-full flex-col border-r bg-background", className)}
    >
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Assessment-List
        </h2>
      </div>

      <div className="flex-1 overflow-auto px-3 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => renderMenuItem(item))}
        </div>
      </div>
    </div>
  );
}
