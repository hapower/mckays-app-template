/**
 * Updates Panel Custom Hook
 * 
 * This hook provides functionality for managing the state and operations for the updates panel.
 * It handles loading updates, searching, filtering by specialty, and provides a clean interface
 * for components to display and interact with medical journal updates.
 * 
 * Key features:
 * - Loading and caching update articles
 * - Search functionality for filtering by title, author, etc.
 * - Specialty filtering
 * - Sort options
 * - Loading states and error handling
 * 
 * @module hooks/use-updates
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { UpdateArticle } from "@/types/library-types"
import { SelectSpecialty } from "@/db/schema"
import { debounce } from "@/lib/utils"

// Mock data for updates - would be replaced with API calls in a future enhancement
const MOCK_UPDATES: UpdateArticle[] = [
  {
    id: "update-1",
    title: "Recent Advances in COPD Management",
    authors: "Johnson M, Williams P, et al.",
    journal: "Journal of Respiratory Medicine",
    year: "2024",
    date: "2024-02-15",
    abstract: "This review discusses recent therapeutic advances in the management of chronic obstructive pulmonary disease (COPD), focusing on novel bronchodilators, anti-inflammatory agents, and targeted therapies. We explore outcomes from recent clinical trials and their implications for clinical practice.",
    doi: "10.1234/jrm.2024.01.005",
    url: "https://example.org/jrm/2024/copd",
    specialtyId: "internal_medicine"
  },
  {
    id: "update-2",
    title: "Artificial Intelligence in Cardiac Imaging",
    authors: "Chen L, Rodriguez K, et al.",
    journal: "Cardiology Today",
    year: "2024",
    date: "2024-02-10",
    abstract: "This paper explores applications of deep learning and artificial intelligence in cardiac imaging modalities, including echocardiography, cardiac MRI, and CT angiography. We examine how AI tools can improve diagnostic accuracy, workflow efficiency, and prognostic assessment.",
    doi: "10.5678/cardio.2024.02.012",
    specialtyId: "cardiology"
  },
  {
    id: "update-3",
    title: "Novel Biologics for Pediatric Asthma",
    authors: "Roberts E, Thompson J, et al.",
    journal: "Pediatric Pulmonology Review",
    year: "2024",
    date: "2024-01-28",
    abstract: "This review summarizes recent developments in biologic therapies for severe asthma in pediatric populations. We discuss efficacy, safety profiles, and practical considerations for implementing these treatments in clinical practice.",
    doi: "10.9012/ppr.2024.01.003",
    specialtyId: "pediatrics"
  },
  {
    id: "update-4",
    title: "Minimally Invasive Approaches for Lumbar Fusion",
    authors: "Garcia H, Smith T, et al.",
    journal: "Orthopedic Surgery Advances",
    year: "2024",
    date: "2024-01-15",
    abstract: "This paper compares conventional and minimally invasive surgical techniques for lumbar spinal fusion, focusing on patient outcomes, complication rates, and recovery times. We provide a critical analysis of recent comparative studies and meta-analyses.",
    specialtyId: "orthopedics"
  },
  {
    id: "update-5",
    title: "Immune Checkpoint Inhibitors in Gastrointestinal Cancers",
    authors: "Adams R, Wilson B, et al.",
    journal: "Journal of Clinical Oncology",
    year: "2024",
    date: "2024-02-05",
    abstract: "This comprehensive review discusses the efficacy and safety of immune checkpoint inhibitors in the treatment of gastrointestinal malignancies. We examine recent trial data for esophageal, gastric, pancreatic, and colorectal cancers.",
    doi: "10.3456/jco.2024.02.016",
    specialtyId: "oncology"
  },
  {
    id: "update-6",
    title: "Advances in Stroke Thrombectomy Techniques",
    authors: "Zhang Q, Patel S, et al.",
    journal: "Neurology Practice",
    year: "2024",
    date: "2024-01-20",
    abstract: "This article reviews recent technological advances in mechanical thrombectomy for acute ischemic stroke, including new device designs, access techniques, and adjunctive therapies. We discuss implications for expanding treatment windows and improving outcomes.",
    doi: "10.7890/neurol.2024.01.022",
    specialtyId: "neurology"
  },
  {
    id: "update-7",
    title: "Managing Treatment-Resistant Depression",
    authors: "Campbell D, Nguyen T, et al.",
    journal: "Psychiatric Treatment Review",
    year: "2024",
    date: "2024-02-01",
    abstract: "This paper examines emerging pharmacological and non-pharmacological approaches for treatment-resistant depression, including ketamine derivatives, psychedelics, neuromodulation techniques, and intensive psychotherapies.",
    specialtyId: "psychiatry"
  },
  {
    id: "update-8",
    title: "Emergency Management of Pediatric Trauma",
    authors: "Martinez J, Taylor K, et al.",
    journal: "Emergency Medicine Journal",
    year: "2024",
    date: "2024-01-12",
    abstract: "This review outlines current best practices for the assessment and management of pediatric trauma patients in emergency settings. We cover initial assessment, damage control strategies, and critical decision-making algorithms.",
    doi: "10.2345/emj.2024.01.007",
    specialtyId: "emergency_medicine"
  }
];

/**
 * Filter state for updates
 */
interface UpdatesFilterState {
  searchQuery: string;
  specialtyId: string;
  sortBy: 'date' | 'title' | 'journal';
  sortOrder: 'asc' | 'desc';
}

/**
 * Return type for the useUpdates hook
 */
interface UseUpdatesReturn {
  /**
   * Array of filtered update articles
   */
  updates: UpdateArticle[];
  
  /**
   * Current loading state
   */
  isLoading: boolean;
  
  /**
   * Error message if any
   */
  error: string | null;
  
  /**
   * Current filter state
   */
  filters: UpdatesFilterState;
  
  /**
   * Set search query for filtering
   */
  setSearchQuery: (query: string) => void;
  
  /**
   * Set specialty ID for filtering
   */
  setSpecialtyFilter: (specialtyId: string) => void;
  
  /**
   * Set sort parameters
   */
  setSortOption: (sortBy: 'date' | 'title' | 'journal', sortOrder: 'asc' | 'desc') => void;
  
  /**
   * Refresh updates data
   */
  refreshUpdates: () => Promise<void>;
  
  /**
   * Add an update to the library
   */
  addToLibrary: (articleId: string) => Promise<boolean>;
  
  /**
   * Map tracking whether articles are in the library
   */
  inLibraryMap: Record<string, boolean>;
}

/**
 * Custom hook for managing medical updates
 * 
 * This hook provides state and functions for loading, filtering,
 * and searching medical journal updates.
 * 
 * @param userId - The current user's ID
 * @param initialSpecialtyId - Optional initial specialty filter
 * @returns State and functions for managing updates
 */
export function useUpdates(
  userId: string,
  initialSpecialtyId?: string
): UseUpdatesReturn {
  // Updates data state
  const [updates, setUpdates] = useState<UpdateArticle[]>([]);
  const [allUpdates, setAllUpdates] = useState<UpdateArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inLibraryMap, setInLibraryMap] = useState<Record<string, boolean>>({});

  // Filter state
  const [filters, setFilters] = useState<UpdatesFilterState>({
    searchQuery: "",
    specialtyId: initialSpecialtyId || "",
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Toast notifications
  const { toast } = useToast();

  /**
   * Load updates data
   * 
   * In a real implementation, this would fetch from an API.
   * For MVP, it uses mock data.
   */
  const loadUpdates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, this would be an API call
      // For now, use mock data
      setAllUpdates(MOCK_UPDATES);
      
      // Apply initial filters
      const filtered = applyFilters(MOCK_UPDATES, filters);
      setUpdates(filtered);
      
      // Simulate checking library status
      const libraryMap: Record<string, boolean> = {};
      MOCK_UPDATES.forEach(update => {
        // Randomly mark some as in library for demo purposes
        libraryMap[update.id] = Math.random() > 0.7;
      });
      setInLibraryMap(libraryMap);
      
    } catch (err) {
      console.error("Error loading updates:", err);
      setError("Failed to load medical updates");
      
      toast({
        title: "Error",
        description: "Failed to load medical updates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  // Load updates on mount and when filters change
  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  /**
   * Apply filters to updates data
   * 
   * @param data - The updates data to filter
   * @param filterState - The current filter state
   * @returns Filtered updates
   */
  const applyFilters = (
    data: UpdateArticle[],
    filterState: UpdatesFilterState
  ): UpdateArticle[] => {
    let result = [...data];
    
    // Apply specialty filter
    if (filterState.specialtyId) {
      result = result.filter(item => 
        item.specialtyId === filterState.specialtyId
      );
    }
    
    // Apply search filter
    if (filterState.searchQuery) {
      const query = filterState.searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.authors.toLowerCase().includes(query) ||
        item.journal.toLowerCase().includes(query) ||
        (item.abstract && item.abstract.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filterState.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'journal':
          comparison = a.journal.localeCompare(b.journal);
          break;
      }
      
      return filterState.sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  };

  /**
   * Set search query with debounce
   */
  const setSearchQuery = useCallback(
    debounce((query: string) => {
      setFilters(prev => ({
        ...prev,
        searchQuery: query
      }));
    }, 300),
    []
  );

  /**
   * Set specialty filter
   */
  const setSpecialtyFilter = useCallback((specialtyId: string) => {
    setFilters(prev => ({
      ...prev,
      specialtyId
    }));
  }, []);

  /**
   * Set sort option
   */
  const setSortOption = useCallback((
    sortBy: 'date' | 'title' | 'journal', 
    sortOrder: 'asc' | 'desc'
  ) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder
    }));
  }, []);

  /**
   * Refresh updates data
   */
  const refreshUpdates = useCallback(async () => {
    await loadUpdates();
  }, [loadUpdates]);

  /**
   * Add an update to the library
   * 
   * In a real implementation, this would call an API.
   * For MVP, it updates the local state only.
   */
  const addToLibrary = useCallback(async (articleId: string): Promise<boolean> => {
    try {
      // In a real implementation, this would call an API
      // For now, just update the local state
      setInLibraryMap(prev => ({
        ...prev,
        [articleId]: true
      }));
      
      toast({
        title: "Added to Library",
        description: "Article added to your library"
      });
      
      return true;
    } catch (err) {
      console.error("Error adding to library:", err);
      
      toast({
        title: "Error",
        description: "Failed to add article to library",
        variant: "destructive"
      });
      
      return false;
    }
  }, [toast]);

  return {
    updates,
    isLoading,
    error,
    filters,
    setSearchQuery,
    setSpecialtyFilter,
    setSortOption,
    refreshUpdates,
    addToLibrary,
    inLibraryMap
  };
}

export default useUpdates; 