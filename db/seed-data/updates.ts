/**
 * Medical Journal Updates Seed Data
 *
 * This module provides seed data for the updates panel in the application.
 * It contains structured mock data representing recent medical journal articles and
 * updates across various specialties. This seed data is used for the MVP version
 * of the application before integrating with actual medical journal APIs.
 *
 * The data structure matches the UpdateArticle interface and includes realistic
 * article metadata like titles, authors, journals, dates, and abstracts.
 *
 * @module db/seed-data/updates
 */

import { UpdateArticle } from "@/types/library-types"

/**
 * Comprehensive seed data for the updates panel
 *
 * Each update contains:
 * - id: Unique identifier
 * - title: Article title
 * - authors: Author names in standard citation format
 * - journal: Name of the publishing journal
 * - year: Publication year
 * - date: Full publication date
 * - abstract: Summary of the article (optional)
 * - doi: Digital Object Identifier (optional)
 * - url: Link to the source (optional)
 * - specialtyId: ID of the related medical specialty
 */
export const updatesSeedData: UpdateArticle[] = [
  // Cardiology
  {
    id: "update-001",
    title:
      "Artificial Intelligence in Cardiac Imaging: Current Applications and Future Directions",
    authors: "Chen L, Rodriguez K, Patel S, et al.",
    journal: "Journal of Cardiovascular Imaging",
    year: "2024",
    date: "2024-02-10",
    abstract:
      "This comprehensive review explores the rapidly evolving applications of deep learning and artificial intelligence in cardiac imaging modalities, including echocardiography, cardiac MRI, and CT angiography. We examine how AI tools can improve diagnostic accuracy, workflow efficiency, and prognostic assessment. The paper also addresses challenges in implementation, regulatory considerations, and promising future developments that may transform cardiovascular care.",
    doi: "10.1234/jci.2024.02.012",
    url: "https://example.org/jci/2024/ai-cardiac-imaging",
    specialtyId: "cardiology"
  },
  {
    id: "update-002",
    title:
      "Novel Biomarkers for Early Detection of Heart Failure with Preserved Ejection Fraction",
    authors: "Wilson B, Thompson J, Adams R, et al.",
    journal: "European Heart Journal",
    year: "2024",
    date: "2024-01-15",
    abstract:
      "This study identifies and validates a panel of novel circulating biomarkers for the early detection of heart failure with preserved ejection fraction (HFpEF). Using proteomics and machine learning approaches, we developed a multi-marker panel that demonstrates superior sensitivity and specificity compared to existing diagnostic methods. Implementation of this biomarker panel could enable earlier intervention and improved outcomes in this challenging patient population.",
    doi: "10.5678/ehj.2024.01.015",
    specialtyId: "cardiology"
  },
  {
    id: "update-003",
    title:
      "Transcatheter Mitral Valve Repair vs. Replacement: A Meta-Analysis of Recent Clinical Trials",
    authors: "Garcia H, Wang Y, Sharma A, et al.",
    journal: "JACC: Cardiovascular Interventions",
    year: "2024",
    date: "2024-03-01",
    abstract:
      "This meta-analysis compares outcomes of transcatheter mitral valve repair versus replacement techniques across recent randomized clinical trials. We analyzed data from 12 studies including over 3,200 patients with various mitral valve pathologies. Results suggest differential efficacy based on underlying pathology, with implications for patient selection and procedural planning. The paper provides a framework for optimizing device selection in the rapidly evolving field of transcatheter mitral valve interventions.",
    doi: "10.9012/jaccint.2024.03.001",
    specialtyId: "cardiology"
  },

  // Internal Medicine
  {
    id: "update-004",
    title: "Recent Advances in COPD Management: A Comprehensive Review",
    authors: "Johnson M, Williams P, Davies C, et al.",
    journal: "Journal of Respiratory Medicine",
    year: "2024",
    date: "2024-02-15",
    abstract:
      "This review discusses recent therapeutic advances in the management of chronic obstructive pulmonary disease (COPD), focusing on novel bronchodilators, anti-inflammatory agents, and targeted therapies. We explore outcomes from recent clinical trials and their implications for clinical practice, including updates to treatment algorithms and emerging precision medicine approaches. The review also addresses advances in pulmonary rehabilitation, telehealth adaptations, and self-management strategies.",
    doi: "10.1234/jrm.2024.02.005",
    url: "https://example.org/jrm/2024/copd-advances",
    specialtyId: "internal_medicine"
  },
  {
    id: "update-005",
    title:
      "Microbiome-Based Therapies for Inflammatory Bowel Disease: Current Evidence and Future Prospects",
    authors: "Miller A, Singh R, Cohen J, et al.",
    journal: "Gastroenterology",
    year: "2024",
    date: "2024-01-22",
    abstract:
      "This article reviews emerging microbiome-based therapeutic approaches for inflammatory bowel disease (IBD), including fecal microbiota transplantation, targeted bacterial consortia, phage therapy, and diet-based interventions. We summarize findings from recent clinical trials and discuss mechanistic insights into how these therapies modulate intestinal inflammation and restore mucosal homeostasis. The paper concludes with a discussion of challenges in translation and future directions for research.",
    doi: "10.3456/gastro.2024.01.022",
    specialtyId: "internal_medicine"
  },
  {
    id: "update-006",
    title:
      "Update on the Management of Type 2 Diabetes: Focus on GLP-1 Receptor Agonists and SGLT2 Inhibitors",
    authors: "Taylor K, Nguyen T, Brown M, et al.",
    journal: "Diabetes Care",
    year: "2024",
    date: "2024-02-28",
    abstract:
      "This clinical update summarizes recent advances in the management of type 2 diabetes, with a focus on GLP-1 receptor agonists and SGLT2 inhibitors. We review evidence for cardiovascular and renal protective effects, weight management benefits, and expanded indications beyond glycemic control. The paper provides practical guidance on patient selection, combination therapy strategies, and management of potential adverse effects in real-world clinical practice.",
    specialtyId: "internal_medicine"
  },

  // Pediatrics
  {
    id: "update-007",
    title:
      "Novel Biologics for Pediatric Asthma: Efficacy, Safety, and Clinical Implementation",
    authors: "Roberts E, Thompson J, Martinez A, et al.",
    journal: "Pediatric Pulmonology Review",
    year: "2024",
    date: "2024-01-28",
    abstract:
      "This review summarizes recent developments in biologic therapies for severe asthma in pediatric populations. We discuss efficacy, safety profiles, and practical considerations for implementing these treatments in clinical practice, with a focus on anti-IgE, anti-IL5, anti-IL4/IL13, and emerging therapeutic targets. The paper includes recommendations for patient selection, monitoring protocols, and transitioning between therapies, supported by analysis of recent clinical trials in children and adolescents.",
    doi: "10.9012/ppr.2024.01.003",
    specialtyId: "pediatrics"
  },
  {
    id: "update-008",
    title:
      "Advances in Pediatric Inflammatory Bowel Disease: Diagnosis, Treatment, and Quality of Life",
    authors: "Wilson J, Parker S, Ahmed K, et al.",
    journal: "Journal of Pediatric Gastroenterology and Nutrition",
    year: "2024",
    date: "2024-02-20",
    abstract:
      "This article reviews recent advances in the management of pediatric inflammatory bowel disease, focusing on innovations in diagnostic techniques, therapeutic approaches, and quality of life interventions. We discuss the implementation of non-invasive biomarkers, therapeutic drug monitoring, novel targeted therapies, and psychosocial support strategies. The paper provides guidance for multidisciplinary care teams on optimizing outcomes across the spectrum of disease severity in children and adolescents.",
    doi: "10.5432/jpgn.2024.02.020",
    specialtyId: "pediatrics"
  },
  {
    id: "update-009",
    title:
      "Neonatal Hypoxic-Ischemic Encephalopathy: Advances in Neuroprotective Strategies",
    authors: "Lee S, Martinez C, White T, et al.",
    journal: "Neonatology",
    year: "2024",
    date: "2024-03-05",
    abstract:
      "This review examines recent advances in neuroprotective strategies for neonatal hypoxic-ischemic encephalopathy (HIE), focusing on therapeutic hypothermia refinements, adjunctive pharmacological approaches, and emerging cellular therapies. We analyze findings from recent clinical trials and preclinical studies, discussing mechanisms of action, optimization of treatment protocols, and development of prediction models for neurological outcomes. The paper provides a framework for implementing these advances in different resource settings.",
    specialtyId: "pediatrics"
  },

  // Dermatology
  {
    id: "update-010",
    title:
      "Biologics in Atopic Dermatitis: Comparative Efficacy and Safety in the Real-World Setting",
    authors: "Zhang Q, Patel S, Garcia M, et al.",
    journal: "Journal of Investigative Dermatology",
    year: "2024",
    date: "2024-02-05",
    abstract:
      "This study reports real-world outcomes of biologic therapies for moderate-to-severe atopic dermatitis, including dupilumab, tralokinumab, and emerging JAK inhibitors. Based on a multi-center registry of over 2,000 patients, we present comparative effectiveness, safety profiles, and persistence rates across different demographic and clinical subgroups. The findings provide guidance for optimizing biologic selection and sequencing in clinical practice beyond the controlled trial environment.",
    doi: "10.6789/jid.2024.02.005",
    specialtyId: "dermatology"
  },
  {
    id: "update-011",
    title:
      "Advanced Non-Invasive Imaging Techniques for Early Detection of Melanoma",
    authors: "Brown R, Li J, Thompson S, et al.",
    journal: "JAMA Dermatology",
    year: "2024",
    date: "2024-01-18",
    abstract:
      "This paper reviews advances in non-invasive imaging techniques for early melanoma detection, including reflectance confocal microscopy, optical coherence tomography, and AI-augmented dermoscopy. We evaluate diagnostic accuracy metrics, implementation considerations, and cost-effectiveness across different clinical settings and patient populations. The review also discusses integration of these technologies into existing screening workflows and implications for reducing unnecessary biopsies while improving early detection rates.",
    doi: "10.7654/jamadermatol.2024.01.018",
    specialtyId: "dermatology"
  },

  // Neurology
  {
    id: "update-012",
    title:
      "Advances in Stroke Thrombectomy Techniques: Devices, Access Routes, and Patient Selection",
    authors: "White H, Johnson K, Rodriguez M, et al.",
    journal: "Neurology Practice",
    year: "2024",
    date: "2024-01-20",
    abstract:
      "This article reviews recent technological advances in mechanical thrombectomy for acute ischemic stroke, including new device designs, access techniques, and adjunctive therapies. We discuss implications for expanding treatment windows and improving outcomes in previously ineligible patient populations. The paper provides a practical framework for implementing these advances in both comprehensive stroke centers and primary stroke centers with transfer protocols.",
    doi: "10.7890/neurol.2024.01.022",
    specialtyId: "neurology"
  },
  {
    id: "update-013",
    title:
      "Disease-Modifying Therapies for Alzheimer's Disease: Clinical Implications of Recent Approvals",
    authors: "Smith B, Taylor M, Clark L, et al.",
    journal: "New England Journal of Medicine",
    year: "2024",
    date: "2024-02-22",
    abstract:
      "This review addresses the clinical implications of recently approved disease-modifying therapies for Alzheimer's disease, focusing on anti-amyloid monoclonal antibodies. We discuss efficacy data, safety profiles, patient selection criteria, and practical considerations for implementation in clinical practice. The paper provides guidance on diagnostic evaluation, monitoring protocols, management of adverse effects, and integration with existing care pathways for patients with mild cognitive impairment and early Alzheimer's disease.",
    doi: "10.1234/nejm.2024.02.022",
    specialtyId: "neurology"
  },

  // Orthopedics
  {
    id: "update-014",
    title:
      "Minimally Invasive Approaches for Lumbar Fusion: Comparative Outcomes and Patient Selection",
    authors: "Garcia H, Smith T, Wilson B, et al.",
    journal: "Orthopedic Surgery Advances",
    year: "2024",
    date: "2024-01-15",
    abstract:
      "This paper compares conventional and minimally invasive surgical techniques for lumbar spinal fusion, focusing on patient outcomes, complication rates, and recovery times. We provide a critical analysis of recent comparative studies and meta-analyses, stratifying results by indication, patient characteristics, and specific surgical approaches. The review concludes with evidence-based recommendations for patient selection and technical considerations to optimize outcomes with minimally invasive techniques.",
    specialtyId: "orthopedics"
  },
  {
    id: "update-015",
    title:
      "Regenerative Approaches for Cartilage Repair: Current Evidence and Clinical Applications",
    authors: "Anderson P, Martin J, Chen L, et al.",
    journal: "Journal of Arthroscopy",
    year: "2024",
    date: "2024-03-10",
    abstract:
      "This review evaluates current evidence for regenerative approaches to cartilage repair, including matrix-associated autologous chondrocyte implantation, stem cell therapies, and scaffold-based techniques. We analyze recent clinical trials, comparative effectiveness data, and long-term outcomes across different anatomical locations and patient populations. The paper provides practical guidance for integrating these approaches into treatment algorithms for chondral and osteochondral defects in clinical practice.",
    doi: "10.5432/arthro.2024.03.010",
    specialtyId: "orthopedics"
  },

  // Oncology
  {
    id: "update-016",
    title:
      "Immune Checkpoint Inhibitors in Gastrointestinal Cancers: A Comprehensive Review",
    authors: "Adams R, Wilson B, Johnson P, et al.",
    journal: "Journal of Clinical Oncology",
    year: "2024",
    date: "2024-02-05",
    abstract:
      "This comprehensive review discusses the efficacy and safety of immune checkpoint inhibitors in the treatment of gastrointestinal malignancies. We examine recent trial data for esophageal, gastric, pancreatic, and colorectal cancers, focusing on patient selection, biomarker development, and management of immune-related adverse events. The paper provides guidance for optimizing immunotherapy sequencing and combination strategies within multimodal treatment approaches for different disease stages and molecular subtypes.",
    doi: "10.3456/jco.2024.02.016",
    specialtyId: "oncology"
  },
  {
    id: "update-017",
    title:
      "Advances in CAR-T Cell Therapy for Hematologic Malignancies: Beyond CD19",
    authors: "Li Q, Martinez A, Taylor S, et al.",
    journal: "Blood",
    year: "2024",
    date: "2024-01-30",
    abstract:
      "This review explores recent advances in CAR-T cell therapy for hematologic malignancies beyond CD19-directed approaches, focusing on novel targets including BCMA, CD22, CD20, and emerging dual-targeted constructs. We discuss innovations in CAR design, manufacturing processes, and strategies to mitigate toxicity and enhance persistence. The paper also addresses emerging applications in multiple myeloma, T-cell malignancies, and refractory lymphomas, with practical considerations for implementation in various clinical settings.",
    doi: "10.8765/blood.2024.01.030",
    specialtyId: "oncology"
  },

  // Psychiatry
  {
    id: "update-018",
    title:
      "Novel Treatment Approaches for Treatment-Resistant Depression: Evidence and Implementation",
    authors: "Campbell D, Nguyen T, Wilson J, et al.",
    journal: "JAMA Psychiatry",
    year: "2024",
    date: "2024-02-01",
    abstract:
      "This paper examines emerging pharmacological and non-pharmacological approaches for treatment-resistant depression, including ketamine derivatives, psychedelics, neuromodulation techniques, and intensive psychotherapies. We review efficacy and safety data from recent clinical trials, discuss patient selection criteria, and provide practical guidance for implementation within existing care pathways. The review also addresses regulatory considerations, treatment sequencing, and monitoring protocols for these novel interventions.",
    specialtyId: "psychiatry"
  },
  {
    id: "update-019",
    title:
      "Digital Health Interventions for Anxiety Disorders: Efficacy, Engagement, and Implementation",
    authors: "Moore S, Harris J, Zhang L, et al.",
    journal: "Journal of Psychiatric Research",
    year: "2024",
    date: "2024-02-25",
    abstract:
      "This systematic review and meta-analysis evaluates the efficacy of digital health interventions for anxiety disorders, including smartphone applications, internet-delivered cognitive behavioral therapy, and virtual reality exposure therapy. We analyze outcomes across different anxiety disorders, delivery formats, and levels of therapist support, with attention to engagement metrics and implementation factors. The paper provides recommendations for clinical integration, quality assessment, and optimizing digital interventions in diverse populations and healthcare settings.",
    doi: "10.2345/jpr.2024.02.025",
    specialtyId: "psychiatry"
  },

  // Emergency Medicine
  {
    id: "update-020",
    title: "Emergency Management of Pediatric Trauma: An Evidence-Based Review",
    authors: "Martinez J, Taylor K, Smith P, et al.",
    journal: "Emergency Medicine Journal",
    year: "2024",
    date: "2024-01-12",
    abstract:
      "This review outlines current best practices for the assessment and management of pediatric trauma patients in emergency settings. We cover initial assessment, damage control strategies, and critical decision-making algorithms, synthesizing recent evidence and consensus guidelines. The paper provides practical approaches to airway management, hemorrhage control, neurological assessment, and family-centered care, with specific considerations for different age groups and resource settings.",
    doi: "10.2345/emj.2024.01.007",
    specialtyId: "emergency_medicine"
  },
  {
    id: "update-021",
    title:
      "Point-of-Care Ultrasound in Critical Care: Applications, Protocols, and Training",
    authors: "Rivera M, Chen S, Robertson T, et al.",
    journal: "Critical Care Medicine",
    year: "2024",
    date: "2024-03-08",
    abstract:
      "This comprehensive review examines the expanding role of point-of-care ultrasound (POCUS) in critical care settings, including emergency departments and intensive care units. We discuss evidence-based applications for cardiac, pulmonary, abdominal, and vascular assessment, with standardized protocols and interpretation guidelines. The paper also addresses implementation strategies, quality assurance, credentialing pathways, and educational approaches for developing and maintaining POCUS competency among emergency and critical care clinicians.",
    doi: "10.5678/ccm.2024.03.008",
    specialtyId: "emergency_medicine"
  }
]
