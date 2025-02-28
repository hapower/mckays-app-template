/**
 * Mobile navigation component for the AttendMe application
 *
 * This component provides a responsive mobile-friendly navigation menu that appears
 * on smaller screens. It includes a hamburger menu button that toggles a sliding panel
 * containing navigation links.
 *
 * @module components/navigation/mobile-nav
 */

"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

/**
 * Interface for navigation item properties
 */
interface NavItem {
  title: string
  href: string
  disabled?: boolean
}

/**
 * Interface for MobileNav component props
 */
interface MobileNavProps {
  items?: NavItem[]
  className?: string
}

/**
 * MobileNav component for responsive navigation on smaller screens
 *
 * @param items - Array of navigation items to display
 * @param className - Optional additional CSS classes
 * @returns A mobile navigation component with a hamburger menu and sliding panel
 *
 * @example
 * ```tsx
 * <MobileNav
 *   items={[
 *     { title: "Home", href: "/" },
 *     { title: "Dashboard", href: "/dashboard" }
 *   ]}
 * />
 * ```
 */
export function MobileNav({ items = [], className }: MobileNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close the mobile nav when the route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <div className={cn("md:hidden", className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground"
            aria-label="Open mobile menu"
          >
            <Menu className="size-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0 sm:max-w-xs">
          <div className="px-7">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground absolute right-4 top-4 md:hidden"
              onClick={() => setIsOpen(false)}
              aria-label="Close mobile menu"
            >
              <X className="size-6" />
              <span className="sr-only">Close menu</span>
            </Button>

            <div className="flex flex-col space-y-4 py-8">
              <Link
                href="/"
                className="text-xl font-bold"
                onClick={() => setIsOpen(false)}
              >
                AttendMe
              </Link>

              <div className="border-border mt-6 border-t pt-6">
                <AnimatePresence>
                  <nav className="flex flex-col space-y-4">
                    {items.map(item => {
                      const isActive = pathname === item.href

                      // Don't render disabled items as clickable links
                      if (item.disabled) {
                        return (
                          <motion.span
                            key={item.title}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-muted-foreground flex items-center py-2 text-lg opacity-60"
                          >
                            {item.title}
                          </motion.span>
                        )
                      }

                      return (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex"
                        >
                          <Link
                            href={item.href}
                            className={cn(
                              "text-foreground/60 hover:text-foreground flex w-full items-center py-2 text-lg font-medium transition-colors",
                              isActive && "text-foreground font-semibold"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.title}
                          </Link>
                        </motion.div>
                      )
                    })}
                  </nav>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
