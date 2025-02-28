/**
 * Specialty Grid Component
 *
 * This component renders a grid of specialty cards, organized into medical and
 * surgical specialty groups. It manages the selection state and provides a
 * responsive layout for browsing available specialties.
 *
 * Features:
 * - Responsive grid layout with appropriate spacing
 * - Grouping of specialties by type (medical vs. surgical)
 * - Selection state management
 * - Staggered animations for visual appeal
 *
 * @module components/specialties/specialty-grid
 */

"use client"

import { SelectSpecialty } from "@/db/schema"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { SpecialtyCard } from "./specialty-card"

export interface SpecialtyGridProps {
  specialties: SelectSpecialty[]
  selectedSpecialtyId?: string | null
  onSelectSpecialty: (specialty: SelectSpecialty) => void
  className?: string
  groupByType?: boolean
}

export function SpecialtyGrid({
  specialties,
  selectedSpecialtyId,
  onSelectSpecialty,
  className,
  groupByType = true
}: SpecialtyGridProps) {
  // Handler for selecting a specialty
  const handleSelect = (specialty: SelectSpecialty) => {
    onSelectSpecialty(specialty)
  }

  // Group specialties by type if requested
  let groupedSpecialties = specialties
  let medicalSpecialties: SelectSpecialty[] = []
  let surgicalSpecialties: SelectSpecialty[] = []

  if (groupByType) {
    // Define which types are considered medical vs. surgical
    const surgicalTypes = ["orthopedics", "cardiology", "oncology"]

    // Group specialties by type
    medicalSpecialties = specialties.filter(
      specialty => !surgicalTypes.includes(specialty.type)
    )

    surgicalSpecialties = specialties.filter(specialty =>
      surgicalTypes.includes(specialty.type)
    )

    // Sort alphabetically within each group
    medicalSpecialties.sort((a, b) => a.name.localeCompare(b.name))
    surgicalSpecialties.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    // Just sort all specialties alphabetically
    groupedSpecialties = [...specialties].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {groupByType ? (
        <>
          {/* Medical specialties section */}
          {medicalSpecialties.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Medical Specialties</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                {medicalSpecialties.map((specialty, index) => (
                  <SpecialtyCard
                    key={specialty.id}
                    specialty={specialty}
                    isSelected={selectedSpecialtyId === specialty.id}
                    onSelect={handleSelect}
                    animationDelay={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Surgical specialties section */}
          {surgicalSpecialties.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Surgical Specialties</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                {surgicalSpecialties.map((specialty, index) => (
                  <SpecialtyCard
                    key={specialty.id}
                    specialty={specialty}
                    isSelected={selectedSpecialtyId === specialty.id}
                    onSelect={handleSelect}
                    animationDelay={index + medicalSpecialties.length}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* All specialties in a single grid */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          {groupedSpecialties.map((specialty, index) => (
            <SpecialtyCard
              key={specialty.id}
              specialty={specialty}
              isSelected={selectedSpecialtyId === specialty.id}
              onSelect={handleSelect}
              animationDelay={index}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {specialties.length === 0 && (
        <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed">
          No specialties found
        </div>
      )}
    </div>
  )
}
