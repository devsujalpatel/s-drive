import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ path, userRootDirId }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center h-6 mt-3 ml-4">
      <ol className="flex items-center gap-1 text-sm">
        {path.map((dir, index) => {
          const isRoot = dir.id === userRootDirId;
          const isLast = index === path.length - 1;
          const label = isRoot ? "My Drive" : dir.name;

          return (
            <li key={dir.id} className="flex items-center gap-1">
              {isLast ? (
                <span
                  className="flex items-center gap-1.5 px-2 py-1 font-medium text-gray-900"
                  title={label}
                >
                  {isRoot && <Home className="h-3.5 w-3.5 text-gray-500" />}
                  <span className="max-w-[200px] truncate">{label}</span>
                </span>
              ) : (
                <Link
                  to={isRoot ? "/" : `/directory/${dir.id}`}
                  title={label}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                >
                  {isRoot && <Home className="h-3.5 w-3.5" />}
                  <span className="max-w-[200px] truncate">{label}</span>
                </Link>
              )}

              {!isLast && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;