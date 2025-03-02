/**
 * Medical Specialties Seed Data
 *
 * This module provides seed data for populating the database with medical specialties.
 * It contains structured data for various medical and surgical specialties, each with
 * descriptive information about the specialty's focus and scope of practice.
 *
 * The specialties are organized into distinct types, matching the specialtyTypeEnum
 * defined in the database schema. This ensures proper categorization and filtering
 * capabilities in the application.
 *
 * @module db/seed-data/specialties
 */

import { InsertSpecialty } from "@/db/schema"

/**
 * Specialty seed data for the database
 *
 * Each specialty contains:
 * - name: The display name of the specialty
 * - description: A brief description of what the specialty focuses on
 * - type: The category of the specialty (matching specialtyTypeEnum values)
 */
export const specialtySeedData: InsertSpecialty[] = [
  // Internal Medicine Specialties
  {
    name: "Internal Medicine",
    description:
      "Focuses on the diagnosis, treatment, and prevention of adult diseases. Internists care for hospitalized and ambulatory patients and may play a major role in teaching and research.",
    type: "internal_medicine"
  },
  {
    name: "Endocrinology",
    description:
      "Specializes in disorders of the endocrine system, including diabetes mellitus, thyroid disorders, osteoporosis, and hormonal imbalances.",
    type: "internal_medicine"
  },
  {
    name: "Gastroenterology",
    description:
      "Focuses on diseases affecting the gastrointestinal tract, including the esophagus, stomach, small intestine, colon, liver, pancreas, and gallbladder.",
    type: "internal_medicine"
  },
  {
    name: "Hematology",
    description:
      "Specializes in disorders of the blood, bone marrow, and lymphatic systems, including anemias, leukemias, lymphomas, and bleeding disorders.",
    type: "internal_medicine"
  },
  {
    name: "Infectious Disease",
    description:
      "Focuses on infections caused by bacteria, viruses, fungi, and parasites, as well as immunodeficiency disorders and infection control.",
    type: "internal_medicine"
  },
  {
    name: "Nephrology",
    description:
      "Specializes in kidney diseases, including chronic kidney disease, dialysis, electrolyte disorders, and kidney transplantation.",
    type: "internal_medicine"
  },
  {
    name: "Pulmonology",
    description:
      "Focuses on diseases of the respiratory system, including the lungs, upper airways, thoracic cavity, and chest wall.",
    type: "internal_medicine"
  },
  {
    name: "Rheumatology",
    description:
      "Specializes in autoimmune diseases and disorders of the joints, muscles, and connective tissues, including arthritis, lupus, and vasculitis.",
    type: "internal_medicine"
  },

  // Cardiology
  {
    name: "Cardiology",
    description:
      "Focuses on disorders of the heart and cardiovascular system, including coronary artery disease, heart failure, arrhythmias, and valvular heart disease.",
    type: "cardiology"
  },
  {
    name: "Interventional Cardiology",
    description:
      "Specializes in catheter-based treatments of cardiovascular diseases, including angioplasty, stent placement, and valve repairs.",
    type: "cardiology"
  },
  {
    name: "Electrophysiology",
    description:
      "Focuses on diagnosing and treating heart rhythm disorders, including pacemaker and defibrillator implantation and ablation procedures.",
    type: "cardiology"
  },

  // Pediatrics
  {
    name: "Pediatrics",
    description:
      "Focuses on the health and medical care of infants, children, and adolescents from birth up to 18 years of age.",
    type: "pediatrics"
  },
  {
    name: "Pediatric Cardiology",
    description:
      "Specializes in diagnosing and treating heart problems in children, including congenital heart defects and acquired heart diseases.",
    type: "pediatrics"
  },
  {
    name: "Neonatology",
    description:
      "Focuses on the medical care of newborn infants, especially ill or premature newborns requiring intensive care.",
    type: "pediatrics"
  },
  {
    name: "Pediatric Neurology",
    description:
      "Specializes in diagnosing and treating neurological disorders in children, including epilepsy, developmental disorders, and neuromuscular diseases.",
    type: "pediatrics"
  },

  // Dermatology
  {
    name: "Dermatology",
    description:
      "Focuses on disorders of the skin, hair, and nails, including inflammatory conditions, infections, allergies, and skin cancers.",
    type: "dermatology"
  },
  {
    name: "Pediatric Dermatology",
    description:
      "Specializes in skin conditions that affect children, including birthmarks, eczema, psoriasis, and rare skin disorders.",
    type: "dermatology"
  },

  // Neurology
  {
    name: "Neurology",
    description:
      "Focuses on disorders of the nervous system, including the brain, spinal cord, peripheral nerves, and muscles.",
    type: "neurology"
  },
  {
    name: "Movement Disorders",
    description:
      "Specializes in conditions that affect movement, such as Parkinson's disease, tremors, dystonia, and Huntington's disease.",
    type: "neurology"
  },
  {
    name: "Epilepsy",
    description:
      "Focuses on the diagnosis and treatment of seizure disorders, including medication management and surgical options.",
    type: "neurology"
  },

  // Orthopedics
  {
    name: "Orthopedics",
    description:
      "Focuses on conditions involving the musculoskeletal system, including bones, joints, ligaments, tendons, muscles, and nerves.",
    type: "orthopedics"
  },
  {
    name: "Sports Medicine",
    description:
      "Specializes in the treatment of athletic injuries and the promotion of physical fitness and sports participation.",
    type: "orthopedics"
  },
  {
    name: "Joint Replacement",
    description:
      "Focuses on surgical replacement of damaged joints, particularly hip and knee replacements for arthritis or injury.",
    type: "orthopedics"
  },
  {
    name: "Spine Surgery",
    description:
      "Specializes in surgical treatments for conditions affecting the spine, including herniated discs, spinal stenosis, and scoliosis.",
    type: "orthopedics"
  },

  // Oncology
  {
    name: "Oncology",
    description:
      "Focuses on the diagnosis and treatment of cancer, including solid tumors and hematologic malignancies.",
    type: "oncology"
  },
  {
    name: "Radiation Oncology",
    description:
      "Specializes in treating cancer with radiation therapy to destroy cancer cells and shrink tumors.",
    type: "oncology"
  },
  {
    name: "Surgical Oncology",
    description:
      "Focuses on the surgical management of cancer, including tumor removal and surgical staging procedures.",
    type: "oncology"
  },
  {
    name: "Hematologic Oncology",
    description:
      "Specializes in cancers affecting the blood, bone marrow, and lymphatic systems, such as leukemia, lymphoma, and myeloma.",
    type: "oncology"
  },

  // Psychiatry
  {
    name: "Psychiatry",
    description:
      "Focuses on the diagnosis, treatment, and prevention of mental, emotional, and behavioral disorders.",
    type: "psychiatry"
  },
  {
    name: "Child & Adolescent Psychiatry",
    description:
      "Specializes in mental, emotional, and behavioral disorders affecting children and teenagers.",
    type: "psychiatry"
  },
  {
    name: "Geriatric Psychiatry",
    description:
      "Focuses on mental health issues specific to older adults, including dementia, depression, and anxiety in the elderly.",
    type: "psychiatry"
  },
  {
    name: "Addiction Psychiatry",
    description:
      "Specializes in the diagnosis and treatment of substance use disorders and process addictions.",
    type: "psychiatry"
  },

  // Emergency Medicine
  {
    name: "Emergency Medicine",
    description:
      "Focuses on the immediate decision-making and action to prevent death or further disability in acute illness or injury situations.",
    type: "emergency_medicine"
  },
  {
    name: "Trauma Surgery",
    description:
      "Specializes in the surgical treatment of injuries, particularly those caused by impact or physical trauma.",
    type: "emergency_medicine"
  },
  {
    name: "Critical Care",
    description:
      "Focuses on the management of patients with life-threatening conditions requiring comprehensive intensive care.",
    type: "emergency_medicine"
  },

  // Other Important Specialties (mapped to closest categories)
  {
    name: "General Surgery",
    description:
      "Focuses on surgical treatment of abdominal organs, breast, thyroid, and hernias, as well as traumatic injuries.",
    type: "orthopedics" // Using orthopedics as the closest category
  },
  {
    name: "Obstetrics & Gynecology",
    description:
      "Focuses on women's reproductive health, pregnancy, childbirth, and disorders of the female reproductive system.",
    type: "internal_medicine" // Using internal medicine as the closest category
  },
  {
    name: "Ophthalmology",
    description:
      "Specializes in disorders and diseases of the eye, including cataracts, glaucoma, and retinal diseases.",
    type: "neurology" // Using neurology as the closest category
  },
  {
    name: "Urology",
    description:
      "Focuses on disorders of the urinary tract system and the male reproductive organs.",
    type: "internal_medicine" // Using internal medicine as the closest category
  }
]

/**
 * Medical specialties - filtered view of all specialties with type 'internal_medicine' or related
 */
export const medicalSpecialties = specialtySeedData.filter(
  specialty =>
    specialty.type === "internal_medicine" ||
    specialty.type === "pediatrics" ||
    specialty.type === "dermatology" ||
    specialty.type === "neurology" ||
    specialty.type === "psychiatry" ||
    specialty.type === "emergency_medicine"
)

/**
 * Surgical specialties - filtered view of all specialties with surgical types
 */
export const surgicalSpecialties = specialtySeedData.filter(
  specialty =>
    specialty.type === "cardiology" ||
    specialty.type === "orthopedics" ||
    specialty.type === "oncology"
)
