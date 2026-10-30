"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const value = props.value ?? props.defaultValue ?? [0];

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200">
        <SliderPrimitive.Range className="absolute h-full bg-[#0f172a]" />
      </SliderPrimitive.Track>
      {Array.isArray(value) ? (
        value.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className="block h-[18px] w-[18px] rounded-full border-2 border-white bg-[#0f172a] shadow-md transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95"
          />
        ))
      ) : (
        <SliderPrimitive.Thumb className="block h-[18px] w-[18px] rounded-full border-2 border-white bg-[#0f172a] shadow-md transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95" />
      )}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

