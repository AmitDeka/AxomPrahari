"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ASSAM_DISTRICTS = [
  "Bajali", "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo",
  "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara",
  "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan",
  "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon",
  "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar",
  "Tinsukia", "Udalguri", "West Karbi Anglong", "Tamulpur"
];

export function ComboboxWithStates1({
  value,
  onChange,
  placeholder = "Select district...",
  className,
  options = ASSAM_DISTRICTS
}) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = searchQuery === ""
    ? options
    : options.filter((option) =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between bg-zinc-900/50 border-zinc-800 text-zinc-200 hover:bg-zinc-800/80 hover:text-white"
        onClick={() => setOpen(!open)}
      >
        {value ? value : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-800 bg-zinc-950 p-1 shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="flex items-center border-b border-zinc-800 px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-zinc-400" />
            <input
              className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-zinc-500 text-zinc-200"
              placeholder="Search district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <p className="p-2 text-center text-sm text-zinc-500">No district found.</p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50",
                    value === option && "bg-zinc-800 text-zinc-50"
                  )}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 opacity-0",
                      value === option && "opacity-100"
                    )}
                  />
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ComboboxWithStates1;
