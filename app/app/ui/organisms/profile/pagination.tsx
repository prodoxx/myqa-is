// import { data } from '@vercel/remix';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '~/ui/atoms/pagination';

export const ProfilePagination = ({
  basePath,
  page,
  pageCount,
  size,
}: {
  basePath: string;
  page: number;
  size: number;
  pageCount: number;
}) => {
  if (pageCount === 0) {
    return null;
  }

  return (
    <Pagination className="py-8">
      <PaginationContent className="flex flex-row items-center space-x-4">
        {page > 0 ? (
          <PaginationItem>
            <PaginationPrevious
              href={`/${basePath}?page=${page - 1}&size=${size}`}
            />
          </PaginationItem>
        ) : (
          <PaginationItem className="px-2 cursor-not-allowed text-sm flex flex-row items-center space-x-1">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </PaginationItem>
        )}

        <PaginationItem>{page + 1}</PaginationItem>

        {page + 1 < pageCount ? (
          <PaginationItem>
            <PaginationNext
              href={`/${basePath}?page=${page + 1}&size=${size}`}
            />
          </PaginationItem>
        ) : (
          <PaginationItem className="px-2 cursor-not-allowed text-sm flex flex-row items-center space-x-1">
            Next
            <ChevronRight className="h-4 w-4" />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
