import { Button } from "./ui/button";

export default function CategoryFilter({ categories, active, onSelect }) {
  return (
    <div className="flex gap-2 flex-wrap justify-center mb-7">
      <Button
        variant={active === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect("all")}
      >
        All
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat}
          variant={active === cat ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(cat)}
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </Button>
      ))}
    </div>
  );
}
