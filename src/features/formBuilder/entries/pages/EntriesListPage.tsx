/**
 * /src/pages/EntriesListPage.tsx
 *
 * Entries list page with filters, pagination, and search.
 * Form version ID is extracted from URL path params.
 * Implements staged filter pattern: draft filters → apply → API call.
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntriesList } from '@/features/formBuilder/entries/hooks/useEntries';
import type { FilterData } from '@/features/formBuilder/entries/utils/filterRegistry';
import MainFilters, {
  type MainFiltersData,
  createDefaultMainFilters,
  countActiveMainFilters,
} from '@/features/formBuilder/entries/components/MainFilters';
import FieldFiltersContainer, {
  type FieldConfig,
} from '@/features/formBuilder/entries/components/FieldFiltersContainer';
import {
  serializeFieldFilters,
  countActiveFilters,
} from '@/features/formBuilder/entries/utils/filterSerializer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  Filter,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

interface RouteParams extends Record<string, string | undefined> {
  formVersionId: string;
}

// ============================================================================
// Main Component
// ============================================================================

export default function EntriesListPage() {
  const navigate = useNavigate();
  const { formVersionId } = useParams<RouteParams>();

  // Validate form version ID from URL
  const parsedFormVersionId = formVersionId
    ? parseInt(formVersionId, 10)
    : null;

  // ========== Draft Filter State (UI State) ==========
  // These represent what's currently in the filter components
  // NOT what's applied to the API query

  const [draftMainFilters, setDraftMainFilters] = useState<MainFiltersData>(
    createDefaultMainFilters(),
  );

  const [draftFieldFilters, setDraftFieldFilters] = useState<
    Map<number, FilterData>
  >(new Map());

  // ========== Applied Filter State ==========
  // These are the filters actually sent to the API
  // Only updated when user clicks "Apply Filters"

  const [appliedMainFilters, setAppliedMainFilters] = useState<MainFiltersData>(
    createDefaultMainFilters(),
  );

  const [appliedFieldFilters, setAppliedFieldFilters] = useState<
    Map<number, FilterData>
  >(new Map());

  // ========== Pagination State ==========

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // ========== Field Configurations ==========
  // In a real app, you'd fetch these from an API endpoint that lists form fields
  // For now, we'll use hardcoded field configs based on your API response

  const fieldConfigs: FieldConfig[] = useMemo(() => {
    if (!parsedFormVersionId) return [];

    // These should ideally come from an API endpoint like GET /api/form-versions/{id}/fields
    // For now, using the field IDs from your example
    return [
      {
        fieldId: 1454,
        fieldTypeId: 1, // Text Input
        label: 'First Name',
        helperText: 'Enter your first name',
      },
      {
        fieldId: 1455,
        fieldTypeId: 1, // Text Input
        label: 'Last Name',
        helperText: 'Enter your last name (optional)',
      },
      {
        fieldId: 1456,
        fieldTypeId: 2, // Email Input (not registered yet, will show warning)
        label: 'Email',
        helperText: 'Enter your Email address',
      },
    ];
  }, [parsedFormVersionId]);

  // ========== Entries Hook ==========

  const {
    entries,
    pagination,
    isLoading,
    hasError,
    error,
    updateQuery,
    refetch,
    clearError,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
  } = useEntriesList({
    initialQuery: parsedFormVersionId
      ? {
          page: currentPage,
          per_page: perPage,
          form_version_id: parsedFormVersionId,
        }
      : undefined,
    autoFetch: !!parsedFormVersionId,
  });

  // ========== Computed Values ==========

  /**
   * Check if draft filters differ from applied filters.
   * Used to show "Unapplied changes" indicator.
   */
  const hasUnappliedChanges = useMemo(() => {
    // Check main filters
    const mainFiltersChanged =
      JSON.stringify(draftMainFilters) !== JSON.stringify(appliedMainFilters);

    // Check field filters
    const fieldFiltersChanged =
      JSON.stringify(Array.from(draftFieldFilters.entries())) !==
      JSON.stringify(Array.from(appliedFieldFilters.entries()));

    return mainFiltersChanged || fieldFiltersChanged;
  }, [
    draftMainFilters,
    appliedMainFilters,
    draftFieldFilters,
    appliedFieldFilters,
  ]);

  /**
   * Total count of active filters (applied).
   */
  const totalActiveFilters = useMemo(() => {
    const mainCount = countActiveMainFilters(appliedMainFilters);
    const fieldCount = countActiveFilters(appliedFieldFilters);
    return mainCount + fieldCount;
  }, [appliedMainFilters, appliedFieldFilters]);

  // ========== Effects ==========

  // Redirect if form version ID is invalid
  useEffect(() => {
    if (!parsedFormVersionId || isNaN(parsedFormVersionId)) {
      console.error('Invalid form version ID in URL');
      // Optionally redirect to error page or forms list
      // navigate('/forms');
    }
  }, [parsedFormVersionId, navigate]);

  // Apply filters to query when appliedFilters or pagination changes
  useEffect(() => {
    if (!parsedFormVersionId) return;

    // Serialize field filters for API
    const serializedFieldFilters = serializeFieldFilters(appliedFieldFilters);

    // Update Redux query (triggers API call)
    updateQuery({
      page: currentPage,
      per_page: perPage,
      form_version_id: parsedFormVersionId,
      // Main filters
      date_from: appliedMainFilters.dateFrom || undefined,
      date_to: appliedMainFilters.dateTo || undefined,
      date_type: appliedMainFilters.dateType || undefined,
      is_considered: appliedMainFilters.isConsidered,
      // Field filters
      field_filters: serializedFieldFilters,
    });
  }, [
    parsedFormVersionId,
    currentPage,
    perPage,
    appliedMainFilters,
    appliedFieldFilters,
    updateQuery,
  ]);

  // ========== Event Handlers ==========

  /**
   * Applies draft filters to active filters (triggers API call via useEffect).
   */
  const handleApplyFilters = () => {
    setAppliedMainFilters(draftMainFilters);
    setAppliedFieldFilters(new Map(draftFieldFilters));
    setCurrentPage(1); // Reset to first page when applying filters
  };

  /**
   * Clears all filters (both draft and applied).
   */
  const handleClearFilters = () => {
    const defaultMainFilters = createDefaultMainFilters();
    const emptyFieldFilters = new Map<number, FilterData>();

    // Clear draft state
    setDraftMainFilters(defaultMainFilters);
    setDraftFieldFilters(emptyFieldFilters);

    // Clear applied state
    setAppliedMainFilters(defaultMainFilters);
    setAppliedFieldFilters(emptyFieldFilters);

    // Reset pagination
    setCurrentPage(1);
  };

  /**
   * Resets draft filters to match currently applied filters.
   * Discards unapplied changes.
   */
  const handleResetDraftFilters = () => {
    setDraftMainFilters(appliedMainFilters);
    setDraftFieldFilters(new Map(appliedFieldFilters));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    goToPage(page);
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(parseInt(value, 10));
    setCurrentPage(1); // Reset to first page
  };

  // ========== Render Helpers ==========

  const renderFilterControls = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Configure filters and click "Apply" to filter entries
              </CardDescription>
            </div>
            {totalActiveFilters > 0 && (
              <Badge variant="secondary">{totalActiveFilters} active</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasUnappliedChanges && (
              <>
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-600"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unapplied changes
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetDraftFilters}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Discard
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              disabled={totalActiveFilters === 0 && !hasUnappliedChanges}
            >
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
            <Button
              size="sm"
              onClick={handleApplyFilters}
              disabled={!hasUnappliedChanges}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Filters */}
        <MainFilters
          onChange={setDraftMainFilters}
          initialFilters={draftMainFilters}
          showCard={false}
        />

        <Separator />

        {/* Field Filters */}
        <FieldFiltersContainer
          fields={fieldConfigs}
          onChange={setDraftFieldFilters}
          initialFilters={draftFieldFilters}
          showCard={false}
        />
      </CardContent>
    </Card>
  );

  const renderError = () => (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{error?.message || 'An unexpected error occurred'}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => clearError()}>
            Dismiss
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );

  const renderTable = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Entries</CardTitle>
            <CardDescription>
              {pagination ? (
                <>
                  Showing {entries.length} of {pagination.total} entries
                </>
              ) : (
                'Loading entries...'
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="per-page" className="whitespace-nowrap">
              Per page:
            </Label>
            <Select value={String(perPage)} onValueChange={handlePerPageChange}>
              <SelectTrigger id="per-page" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && entries.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">
              Loading entries...
            </span>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No entries found matching your filters.</p>
            <Button
              variant="link"
              onClick={handleClearFilters}
              className="mt-2"
            >
              Clear filters to see all entries
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Current Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Considered</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.creator.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.creator.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{entry.current_stage.name}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            entry.is_complete
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {entry.is_complete ? 'Complete' : 'In Progress'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {entry.is_considered ? (
                          <span className="text-green-600">✓ Yes</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(entry.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/entries/${entry.id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Loading overlay for refetch */}
            {isLoading && entries.length > 0 && (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderPagination = () => {
    if (!pagination || pagination.total === 0) return null;

    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      pagination.last_page,
      startPage + maxVisiblePages - 1,
    );

    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => hasPreviousPage && previousPage()}
                className={
                  !hasPreviousPage
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>

            {startPage > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(1)}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {startPage > 2 && (
                  <PaginationItem>
                    <span className="px-4">...</span>
                  </PaginationItem>
                )}
              </>
            )}

            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {endPage < pagination.last_page && (
              <>
                {endPage < pagination.last_page - 1 && (
                  <PaginationItem>
                    <span className="px-4">...</span>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(pagination.last_page)}
                    className="cursor-pointer"
                  >
                    {pagination.last_page}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => hasNextPage && nextPage()}
                className={
                  !hasNextPage
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  // ========== Main Render ==========

  // Handle invalid form version ID
  if (!parsedFormVersionId || isNaN(parsedFormVersionId)) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Form Version</AlertTitle>
          <AlertDescription>
            The form version ID in the URL is invalid. Please check the URL and
            try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Entries List</h1>
        <p className="text-muted-foreground">
          Form Version ID:{' '}
          <span className="font-mono">{parsedFormVersionId}</span>
        </p>
      </div>

      {hasError && renderError()}
      {renderFilterControls()}
      {renderTable()}
      {renderPagination()}
    </div>
  );
}
