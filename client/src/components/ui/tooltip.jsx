import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  useState,
} from "react";

const TooltipContext = createContext(null);

export function TooltipProvider({ children }) {
  return children;
}

export function Tooltip({ children }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <TooltipContext.Provider value={{ open, setOpen, contentId }}>
      <div className="relative w-full min-w-0">{children}</div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({ asChild = false, children }) {
  const context = useContext(TooltipContext);

  if (!context) {
    throw new Error("TooltipTrigger must be used within Tooltip");
  }

  const triggerProps = {
    "aria-describedby": context.open ? context.contentId : undefined,
    onFocus: () => context.setOpen(true),
    onBlur: () => context.setOpen(false),
    onMouseEnter: () => context.setOpen(true),
    onMouseLeave: () => context.setOpen(false),
  };

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      ...triggerProps,
      onFocus: (event) => {
        children.props.onFocus?.(event);
        triggerProps.onFocus(event);
      },
      onBlur: (event) => {
        children.props.onBlur?.(event);
        triggerProps.onBlur(event);
      },
      onMouseEnter: (event) => {
        children.props.onMouseEnter?.(event);
        triggerProps.onMouseEnter(event);
      },
      onMouseLeave: (event) => {
        children.props.onMouseLeave?.(event);
        triggerProps.onMouseLeave(event);
      },
    });
  }

  return <span {...triggerProps}>{children}</span>;
}

export function TooltipContent({ children, side = "top", className = "" }) {
  const context = useContext(TooltipContext);

  if (!context) {
    throw new Error("TooltipContent must be used within Tooltip");
  }

  if (!context.open) return null;

  const sideClasses = {
    top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
    bottom: "left-1/2 top-full mt-2 -translate-x-1/2",
    left: "right-full top-1/2 mr-2 -translate-y-1/2",
    right: "left-full top-1/2 ml-2 -translate-y-1/2",
  };

  return (
    <span
      id={context.contentId}
      role="tooltip"
      className={`pointer-events-none absolute z-1000 whitespace-nowrap rounded-md bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white shadow-md ${
        sideClasses[side] || sideClasses.top
      } ${className}`}
    >
      {children}
    </span>
  );
}
