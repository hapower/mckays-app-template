/**
 * Dashboard Grid Component
 *
 * This component provides a responsive layout grid for the AttendMe dashboard.
 * It arranges the content in a 2x2 grid on larger screens and collapses to a single
 * column on mobile devices, optimizing the display for different screen sizes.
 *
 * Key features:
 * - Responsive 2x2 grid layout that adapts to screen size
 * - Column-based layout on mobile devices
 * - Dynamic height adjustment based on screen size
 * - Customizable gap and padding
 * - Support for full-width panels on mobile
 *
 * @module components/dashboard/dashboard-grid
 */

"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Props for the DashboardGrid component
 */
interface DashboardGridProps {
  /**
   * Top-left panel content (Chat)
   */
  topLeftPanel: React.ReactNode

  /**
   * Top-right panel content (Specialties)
   */
  topRightPanel: React.ReactNode

  /**
   * Bottom-left panel content (Library)
   */
  bottomLeftPanel: React.ReactNode

  /**
   * Bottom-right panel content (Updates)
   */
  bottomRightPanel: React.ReactNode

  /**
   * Optional className for additional styling
   */
  className?: string
}

/**
 * Dashboard Grid Component
 *
 * This component provides a responsive 2x2 grid layout for the dashboard,
 * adapting to different screen sizes and device types.
 *
 * @param props - Component properties
 * @returns A React component that renders a responsive dashboard grid
 */
export function DashboardGrid({
  topLeftPanel,
  topRightPanel,
  bottomLeftPanel,
  bottomRightPanel,
  className
}: DashboardGridProps) {
  // State to track window resize for dynamic height calculations
  const [windowHeight, setWindowHeight] = useState<number>(0)
  const [isMobileView, setIsMobileView] = useState<boolean>(false)

  // Update height and check mobile view on window resize
  useEffect(() => {
    // Set initial values
    setWindowHeight(window.innerHeight)
    setIsMobileView(window.innerWidth < 1024) // lg breakpoint

    // Handle window resize
    const handleResize = () => {
      setWindowHeight(window.innerHeight)
      setIsMobileView(window.innerWidth < 1024)
    }

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Calculate panel heights based on window height
  const topPanelHeight = isMobileView
    ? `calc(${windowHeight}px - 12rem)` // Taller on mobile
    : `calc(${windowHeight}px - 14rem)`

  const bottomPanelHeight = isMobileView
    ? "auto" // Auto height on mobile
    : `calc(${windowHeight / 2}px - 9rem)` // Half height minus padding/header on desktop

  return (
    <div className={cn("grid w-full gap-4 lg:grid-cols-2 lg:gap-6", className)}>
      {/* Top-left panel (Chat) - full height on all screens */}
      <div
        className="order-1 w-full lg:order-1"
        style={{ height: topPanelHeight }}
      >
        {topLeftPanel}
      </div>

      {/* Top-right panel (Specialties) - full height on all screens */}
      <div
        className="order-2 w-full lg:order-2"
        style={{ height: topPanelHeight }}
      >
        {topRightPanel}
      </div>

      {/* Bottom-left panel (Library) - half height on desktop */}
      <div
        className="order-3 w-full lg:order-3"
        style={{ height: bottomPanelHeight }}
      >
        {bottomLeftPanel}
      </div>

      {/* Bottom-right panel (Updates) - half height on desktop */}
      <div
        className="order-4 w-full lg:order-4"
        style={{ height: bottomPanelHeight }}
      >
        {bottomRightPanel}
      </div>
    </div>
  )
}

export default DashboardGrid
