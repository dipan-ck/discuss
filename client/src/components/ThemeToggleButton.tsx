"use client"

import { useTheme } from 'next-themes'
import { Moon, Sun  } from 'lucide-react'

function ThemeToggleButton() {

    const { theme, setTheme } = useTheme();
        const themeOptions = [
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
        ];


  return (
           <div className="px-3 py-2">
                            <div className="flex gap-1 p-1 bg-muted/50 border rounded-md">
                                {themeOptions.map((option) => {
                                    const Icon = option.icon;
                                    const isActive = theme === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTheme(option.value);
                                            }}
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded transition-all ${
                                                isActive
                                                    ? 'bg-background shadow-sm text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                            }`}
                                            title={option.label}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            <span className="text-xs font-medium">{option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
  )
}

export default ThemeToggleButton