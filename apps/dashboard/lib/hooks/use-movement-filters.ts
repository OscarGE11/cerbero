"use client";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type {
  MovementQueryParams,
  MovementSortField,
  SortOrder,
} from "@cerbero/shared";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type CategoryFilterValue = {
  categoryIds: string[];
  includeCustom: boolean;
  customCategory: string;
};

export type MovementFilterInputs = {
  page: number;
  pageSize: number;
  title: string;
  comment: string;
  category: CategoryFilterValue;
  sortBy?: MovementSortField;
  sortOrder?: SortOrder;
};

const DEFAULT_PAGE_SIZE = 10;

function parseCategoryFilter(
  searchParams: URLSearchParams,
): CategoryFilterValue {
  const categoryIdsParam = searchParams.get("categoryIds");
  return {
    categoryIds: categoryIdsParam
      ? categoryIdsParam.split(",").filter(Boolean)
      : [],
    includeCustom: searchParams.get("includeCustom") === "true",
    customCategory: searchParams.get("customCategory") ?? "",
  };
}

function parseInputs(searchParams: URLSearchParams): MovementFilterInputs {
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");

  return {
    page: Math.max(1, Number(searchParams.get("page") ?? "1") || 1),
    pageSize: Math.max(
      1,
      Number(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE)) ||
        DEFAULT_PAGE_SIZE,
    ),
    title: searchParams.get("title") ?? "",
    comment: searchParams.get("comment") ?? "",
    category: parseCategoryFilter(searchParams),
    sortBy: (sortBy as MovementSortField | null) ?? undefined,
    sortOrder: (sortOrder as SortOrder | null) ?? undefined,
  };
}

function buildSearchParams(inputs: MovementFilterInputs): URLSearchParams {
  const params = new URLSearchParams();

  if (inputs.page > 1) params.set("page", String(inputs.page));
  if (inputs.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(inputs.pageSize));
  }
  if (inputs.title) params.set("title", inputs.title);
  if (inputs.comment) params.set("comment", inputs.comment);
  if (inputs.category.categoryIds.length > 0) {
    params.set("categoryIds", inputs.category.categoryIds.join(","));
  }
  if (inputs.category.includeCustom) {
    params.set("includeCustom", "true");
  }
  if (inputs.category.customCategory) {
    params.set("customCategory", inputs.category.customCategory);
  }
  if (inputs.sortBy) params.set("sortBy", inputs.sortBy);
  if (inputs.sortOrder) params.set("sortOrder", inputs.sortOrder);

  return params;
}

function toQueryParams(inputs: MovementFilterInputs): MovementQueryParams {
  const params: MovementQueryParams = {
    page: inputs.page,
    pageSize: inputs.pageSize,
  };

  if (inputs.title) params.title = inputs.title;
  if (inputs.comment) params.comment = inputs.comment;
  if (inputs.category.categoryIds.length > 0) {
    params.categoryIds = inputs.category.categoryIds;
  }
  if (inputs.category.includeCustom) {
    params.includeCustom = true;
  }
  if (inputs.category.customCategory) {
    params.customCategory = inputs.category.customCategory;
  }
  if (inputs.sortBy) params.sortBy = inputs.sortBy;
  if (inputs.sortOrder) params.sortOrder = inputs.sortOrder;

  return params;
}

const SORT_FIELD_MAP: Record<string, MovementSortField> = {
  category: "category",
  amount: "amount",
  title: "title",
  comment: "comment",
  createdAt: "createdAt",
};

export function useMovementFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const inputs = useMemo(() => parseInputs(searchParams), [searchParams]);

  const debouncedTitle = useDebouncedValue(inputs.title);
  const debouncedComment = useDebouncedValue(inputs.comment);
  const debouncedCustomCategory = useDebouncedValue(
    inputs.category.customCategory,
  );

  const queryParams = useMemo((): MovementQueryParams => {
    const debouncedInputs: MovementFilterInputs = {
      ...inputs,
      title: debouncedTitle,
      comment: debouncedComment,
      category: {
        ...inputs.category,
        customCategory: debouncedCustomCategory,
      },
    };
    return toQueryParams(debouncedInputs);
  }, [inputs, debouncedTitle, debouncedComment, debouncedCustomCategory]);

  const replaceUrl = useCallback(
    (next: MovementFilterInputs) => {
      const params = buildSearchParams(next);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  const setFilter = useCallback(
    (columnId: string, value: unknown) => {
      const next: MovementFilterInputs = { ...inputs, page: 1 };

      switch (columnId) {
        case "title":
          next.title = String(value ?? "");
          break;
        case "comment":
          next.comment = String(value ?? "");
          break;
        case "category":
          next.category = value as CategoryFilterValue;
          break;
        default:
          return;
      }

      replaceUrl(next);
    },
    [inputs, replaceUrl],
  );

  const setSort = useCallback(
    (columnId: string, order: "asc" | "desc" | null) => {
      const next: MovementFilterInputs = { ...inputs, page: 1 };

      if (!order) {
        next.sortBy = undefined;
        next.sortOrder = undefined;
      } else {
        next.sortBy = SORT_FIELD_MAP[columnId];
        next.sortOrder = order;
      }

      replaceUrl(next);
    },
    [inputs, replaceUrl],
  );

  const setPage = useCallback(
    (page: number) => {
      replaceUrl({ ...inputs, page });
    },
    [inputs, replaceUrl],
  );

  const clearFilters = useCallback(() => {
    replaceUrl({
      page: 1,
      pageSize: inputs.pageSize,
      title: "",
      comment: "",
      category: {
        categoryIds: [],
        includeCustom: false,
        customCategory: "",
      },
      sortBy: undefined,
      sortOrder: undefined,
    });
  }, [inputs.pageSize, replaceUrl]);

  const hasActiveFilters =
    inputs.title !== "" ||
    inputs.comment !== "" ||
    inputs.category.categoryIds.length > 0 ||
    inputs.category.includeCustom ||
    inputs.category.customCategory !== "";

  const sort = inputs.sortBy
    ? { columnId: inputs.sortBy, order: inputs.sortOrder ?? "desc" }
    : undefined;

  const filtersForTable: Record<string, unknown> = {
    title: inputs.title,
    comment: inputs.comment,
    category: inputs.category,
  };

  return {
    inputs,
    queryParams,
    filters: filtersForTable,
    sort,
    hasActiveFilters,
    setFilter,
    setSort,
    setPage,
    clearFilters,
  };
}
