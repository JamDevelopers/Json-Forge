import React from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2,
  Tag
} from 'lucide-react';

interface TreeViewProps {
  data: any;
  rawJson: string;
}

export const TreeView: React.FC<TreeViewProps> = ({ data, rawJson }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandAllSignal, setExpandAllSignal] = React.useState<boolean | null>(true);
  const [copiedPath, setCopiedPath] = React.useState<string | null>(null);

  if (!rawJson.trim() || data === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#5C6370] text-xs p-6 text-center bg-[#0A0C10]">
        <Tag className="w-8 h-8 mb-2 opacity-40 text-[#8E9299]" />
        <span>No valid JSON data available to render tree.</span>
      </div>
    );
  }

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0C10] text-[#E0E0E0] overflow-hidden">
      {/* Tree View Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 bg-[#151921] border-b border-[#2D3139] text-xs shrink-0">
        {/* Search Filter */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5C6370]" />
          <input
            id="tree-search-input"
            type="text"
            placeholder="Filter keys or values..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-0.5 bg-[#0A0C10] border border-[#2D3139] rounded text-[11px] font-mono text-[#E0E0E0] placeholder-[#5C6370] focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Tree Actions */}
        <div className="flex items-center gap-1.5">
          <button
            id="expand-all-tree-btn"
            onClick={() => setExpandAllSignal(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#2D3139] hover:bg-[#3D424D] text-[#E0E0E0] text-[10px] font-mono transition-colors"
          >
            <Maximize2 className="w-3 h-3 text-indigo-400" />
            <span>Expand All</span>
          </button>

          <button
            id="collapse-all-tree-btn"
            onClick={() => setExpandAllSignal(false)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#2D3139] hover:bg-[#3D424D] text-[#E0E0E0] text-[10px] font-mono transition-colors"
          >
            <Minimize2 className="w-3 h-3 text-[#8E9299]" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Tree Content Canvas */}
      <div className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed select-text bg-[#0A0C10]">
        <TreeNode
          name="root"
          value={data}
          path="$"
          depth={0}
          searchQuery={searchQuery.toLowerCase()}
          expandAllSignal={expandAllSignal}
          onCopyPath={handleCopyPath}
          copiedPath={copiedPath}
        />
      </div>
    </div>
  );
};

interface TreeNodeProps {
  name: string | number;
  value: any;
  path: string;
  depth: number;
  searchQuery: string;
  expandAllSignal: boolean | null;
  onCopyPath: (path: string) => void;
  copiedPath: string | null;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  name,
  value,
  path,
  depth,
  searchQuery,
  expandAllSignal,
  onCopyPath,
  copiedPath,
}) => {
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const [isOpen, setIsOpen] = React.useState(depth < 3);

  React.useEffect(() => {
    if (expandAllSignal !== null) {
      setIsOpen(expandAllSignal);
    }
  }, [expandAllSignal]);

  const matchesSearch = React.useMemo(() => {
    if (!searchQuery) return true;
    const nameStr = String(name).toLowerCase();
    if (nameStr.includes(searchQuery)) return true;
    if (!isObject && String(value).toLowerCase().includes(searchQuery)) return true;
    return false;
  }, [searchQuery, name, value, isObject]);

  if (isObject) {
    const keys = Object.keys(value);
    const count = keys.length;
    const label = isArray ? `Array[${count}]` : `Object{${count}}`;

    return (
      <div className="my-0.5">
        <div className="flex items-center gap-1 group hover:bg-[#1A1D23] px-1 py-0.5 rounded cursor-pointer transition-colors">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-0.5 text-[#5C6370] hover:text-[#E0E0E0] focus:outline-none"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <span
            onClick={() => setIsOpen(!isOpen)}
            className={`font-semibold ${
              name === 'root' ? 'text-indigo-400' : 'text-[#D19A66]'
            }`}
          >
            {typeof name === 'string' ? `'${name}'` : name}:
          </span>

          <span className="text-emerald-400 text-[11px] font-mono">{label}</span>

          <button
            onClick={() => onCopyPath(path)}
            title={`Copy JSONPath: ${path}`}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-indigo-400 text-[#5C6370] ml-1 transition-opacity"
          >
            {copiedPath === path ? (
              <Check className="w-3 h-3 text-[#98C379]" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="pl-4 border-l border-[#2D3139] ml-2">
            {keys.map((k) => {
              const childVal = value[k];
              const childPath = isArray ? `${path}[${k}]` : `${path}.${k}`;
              return (
                <TreeNode
                  key={k}
                  name={isArray ? Number(k) : k}
                  value={childVal}
                  path={childPath}
                  depth={depth + 1}
                  searchQuery={searchQuery}
                  expandAllSignal={expandAllSignal}
                  onCopyPath={onCopyPath}
                  copiedPath={copiedPath}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (!matchesSearch) return null;

  const renderValueBadge = () => {
    if (value === null) {
      return <span className="text-emerald-400 italic">null</span>;
    }
    if (typeof value === 'string') {
      return <span className="text-[#98C379] font-normal">'{value}'</span>;
    }
    if (typeof value === 'number') {
      return <span className="text-[#D19A66] font-semibold">{value}</span>;
    }
    if (typeof value === 'boolean') {
      return (
        <span className={value ? 'text-[#98C379] font-semibold' : 'text-rose-400 font-semibold'}>
          {String(value)}
        </span>
      );
    }
    return <span className="text-[#E0E0E0]">{String(value)}</span>;
  };

  return (
    <div className="flex items-center gap-1.5 my-0.5 group hover:bg-[#1A1D23] px-1 py-0.5 rounded transition-colors">
      <span className="text-[#D19A66] font-medium">{typeof name === 'string' ? `'${name}'` : name}:</span>
      {renderValueBadge()}
      <button
        onClick={() => onCopyPath(path)}
        title={`Copy JSONPath: ${path}`}
        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-indigo-400 text-[#5C6370] ml-1 transition-opacity"
      >
        {copiedPath === path ? (
          <Check className="w-3 h-3 text-[#98C379]" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </div>
  );
};
