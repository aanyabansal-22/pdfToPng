import React, {useState} from "react";
import ToolCard from "./ToolCard";
import tools from "../../data/toolsData";
import { Sparkles } from "lucide-react";

const ToolsGrid = () => {

const [searchQuery, setSearchQuery] = useState("");
const suggestions = searchQuery
  ? tools
      .filter((tool) =>
        tool.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
      .slice(0, 5)
  : [];

const filteredTools = tools.filter((tool) => {
  const query = searchQuery
    .toLowerCase()
    .trim()
    .replace(/[-_\s]+/g, "");

  const toolName = tool.name
    .toLowerCase()
    .replace(/[-_\s]+/g, "");

  const toolDescription = tool.description
    .toLowerCase()
    .replace(/[-_\s]+/g, "");

  return (
    toolName.includes(query) ||
    toolDescription.includes(query)
  );
});


  return (
    <section id="tools" className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 mb-6">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-700">
            Professional Tools
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900">
          Everything You Need
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Choose from our suite of powerful, privacy-first conversion tools
        </p>
      </div>

 

<div className="max-w-md mx-auto mb-10 relative">
  <input
    type="text"
    aria-label="Search converters and tools"
    placeholder="Search converters and tools..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
  />

  {searchQuery && suggestions.length > 0 && (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
      {suggestions.map((tool) => (
        <button
          key={tool.id}
          type="button" 
          onClick={() => setSearchQuery(tool.name)}
          className="w-full px-4 py-3 text-left text-slate-700 transition-all hover:bg-white/40 hover:text-orange-600">
          {tool.name}
        </button>
      ))}
    </div>
  )}
</div>

{filteredTools.length > 0 ? (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
    {filteredTools.map((tool, idx) => (
      <ToolCard key={tool.id} tool={tool} index={idx} />
    ))}
  </div>
) : (
  <div className="text-center py-12">
    <p className="text-slate-500 text-lg">
      No tools found
    </p>
  </div>
)}
    </section>
  );
};

export default ToolsGrid;
