import { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";

interface Session {
  id: string;
  title: string;
  skills: string[];
  description: string;
  tutorName: string;
}

interface SearchFilterProps<T extends Session> {
  data: T[];
  onFilteredData: (filtered: T[]) => void;
}

export default function SearchFilter<T extends Session>({
  data,
  onFilteredData,
}: SearchFilterProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [uniqueSkills, setUniqueSkills] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Extract unique skills from data
  useEffect(() => {
    const skillsSet = new Set<string>();
    data.forEach((session) => {
      (session.skills || []).forEach((skill) => skillsSet.add(skill));
    });
    setUniqueSkills(Array.from(skillsSet));
  }, [data]);

  // Apply search and filter
  useEffect(() => {
    let filtered = [...data];

    // Search across title, description, tutorName, and skills
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((session) => {
        const titleMatch = session.title?.toLowerCase().includes(queryLower);
        const descriptionMatch = session.description
          ?.toLowerCase()
          .includes(queryLower);
        const tutorNameMatch = session.tutorName
          ?.toLowerCase()
          .includes(queryLower);
        const skillsMatch = session.skills?.some((skill) =>
          skill.toLowerCase().includes(queryLower)
        );

        return titleMatch || descriptionMatch || tutorNameMatch || skillsMatch;
      });
    }

    // Filter by skills
    if (selectedSkills.length > 0) {
      filtered = filtered.filter((session) =>
        selectedSkills.every((skill) => (session.skills || []).includes(skill))
      );
    }

    onFilteredData(filtered);
  }, [searchQuery, selectedSkills, data, onFilteredData]);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6  p-4 rounded-lg">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by title, description, tutor, or skills..."
          className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-background"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Skills Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center p-3 border border-background-300 rounded-lg bg-background hover:bg-background"
        >
          <Filter className="w-5 h-5 mr-2 text-gray-600" />
          Filter by Skills ({selectedSkills.length})
        </button>
        {isFilterOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-background border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {uniqueSkills.length === 0 ? (
              <p className="p-3 text-gray-500">No skills available</p>
            ) : (
              uniqueSkills.map((skill) => (
                <label
                  key={skill}
                  className="flex items-center p-3 hover:bg-back cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                    className="mr-2"
                  />
                  {skill}
                </label>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
