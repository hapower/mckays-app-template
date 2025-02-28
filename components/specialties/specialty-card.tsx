/**
 * Specialty Card Component
 *
 * This component renders an individual specialty card that users can click to select
 * a medical specialty. It displays the specialty name and visual indication of its
 * selected state, with appropriate hover and focus states.
 *
 * Features:
 * - Visual distinction between selected and unselected states
 * - Smooth animations on hover and selection
 * - Accessibility support with keyboard navigation
 * - Responsive sizing based on container
 *
 * @module components/specialties/specialty-card
 */

"use client"

import { SelectSpecialty } from "@/db/schema"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { useState } from "react"

export interface SpecialtyCardProps {
  specialty: SelectSpecialty
  isSelected?: boolean
  onSelect: (specialty: SelectSpecialty) => void
  className?: string
  animationDelay?: number
}

export function SpecialtyCard({
  specialty,
  isSelected = false,
  onSelect,
  className,
  animationDelay = 0
}: SpecialtyCardProps) {
  // Track hover state for enhanced animations
  const [isHovered, setIsHovered] = useState(false)

  // Handle click event to select the specialty
  const handleSelect = () => {
    onSelect(specialty)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: animationDelay * 0.1,
        ease: "easeOut"
      }}
      className={cn(
        "relative cursor-pointer rounded-xl border p-4 transition-all duration-200",
        isSelected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-border bg-card hover:border-primary/50 hover:shadow-sm",
        className
      )}
      onClick={handleSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleSelect()
        }
      }}
    >
      {/* Specialty name */}
      <div className="flex items-center justify-between gap-2">
        <h3
          className={cn(
            "font-medium transition-colors",
            isSelected ? "text-primary" : "text-foreground"
          )}
        >
          {specialty.name}
        </h3>

        {/* Check icon for selected state */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircle className="text-primary size-5" />
          </motion.div>
        )}
      </div>

      {/* Optional description with animation */}
      {specialty.description && (
        <motion.p
          className="text-muted-foreground mt-1 text-sm"
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: isSelected || isHovered ? "auto" : 0,
            opacity: isSelected || isHovered ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          {specialty.description}
        </motion.p>
      )}

      {/* Visual indicator for specialty type */}
      <div
        className={cn(
          "absolute bottom-2 right-2 size-2 rounded-full",
          specialty.type.includes("surgery") ||
            specialty.type === "orthopedics" ||
            specialty.type === "cardiology" ||
            specialty.type === "oncology"
            ? "bg-blue-500" // Surgical specialties
            : "bg-green-500" // Medical specialties
        )}
      />
    </motion.div>
  )
}
