/**
 * Main navigation component for the AttendMe application
 *
 * This component renders the main horizontal navigation links used in the site header.
 * It provides navigation to primary application routes and handles active route styling.
 *
 * @module components/navigation/main-nav
 */

"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

/**
 * Interface for navigation item properties
 */
interface NavItem {
  title: string
  href: string
  disabled?: boolean
}

/**
 * Interface for MainNav component props
 */
interface MainNavProps {
  items?: NavItem[]
  className?: string
}

/**
 * MainNav component for primary site navigation
 *
 * @param items - Array of navigation items to display
 * @param className - Optional additional CSS classes
 * @returns A navigation component with links
 *
 * @example
 * ```tsx
 * <MainNav
 *   items={[
 *     { title: "Home", href: "/" },
 *     { title: "Dashboard", href: "/dashboard" }
 *   ]}
 * />
 * ```
 */
export function MainNav({ items = [], className }: MainNavProps) {
  // Get current pathname to highlight active link
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {items.map(item => {
        // Check if the current path matches the nav item's path
        const isActive = pathname === item.href

        // Don't render disabled items as clickable links
        if (item.disabled) {
          return (
            <span
              key={item.title}
              className="text-muted-foreground flex items-center text-sm font-medium opacity-60"
            >
              {item.title}
            </span>
          )
        }

        return (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "text-foreground/60 hover:text-foreground/80 flex items-center text-sm font-medium transition-colors",
              isActive && "text-foreground font-semibold"
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
