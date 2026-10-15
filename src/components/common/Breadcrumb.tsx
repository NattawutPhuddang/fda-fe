import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs sm:text-sm text-slate-500 mb-4 overflow-x-auto whitespace-nowrap">
      <Link to="/" className="inline-flex items-center gap-1 hover:text-slate-800 transition">
        <Home className="w-3.5 h-3.5" />
        <span>หน้าหลัก</span>
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400 flex-shrink-0" />
          {item.path ? (
            <Link to={item.path} className="hover:text-blue-700 transition">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-800">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
