import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const handleClick = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button onClick={handleClick} className="absolute right-4 top-4 z-999">
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
