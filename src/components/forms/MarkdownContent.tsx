import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "cn";

const inlineComponents: Components = {
  p: ({ children }) => <span>{children}</span>,
};

const inlineElements = ["p", "strong", "em", "del", "code", "a", "br"];

type MarkdownContentProps = {
  content: string;
  variant?: "inline" | "block";
  className?: string;
};

export function MarkdownContent({
  content,
  variant = "block",
  className,
}: MarkdownContentProps) {
  const markdown = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      {...(variant === "inline"
        ? {
            allowedElements: inlineElements,
            components: inlineComponents,
            unwrapDisallowed: true,
          }
        : {})}
    >
      {content}
    </ReactMarkdown>
  );

  if (variant === "inline") {
    return (
      <span className={cn("min-w-0 break-words", className)}>{markdown}</span>
    );
  }

  return (
    <div
      className={cn(
        "min-w-0 break-words [&_a]:text-accent-dark [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-(--line) [&_blockquote]:pl-3 [&_code]:rounded-[2px] [&_code]:bg-(--paper-deep) [&_code]:px-1 [&_h1]:my-3 [&_h1]:text-[1.4em] [&_h1]:font-bold [&_h2]:my-2.5 [&_h2]:text-[1.2em] [&_h2]:font-semibold [&_h3]:my-2 [&_h3]:font-semibold [&_li+li]:mt-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:m-0 [&_p+p]:mt-2.5 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-[2px] [&_pre]:bg-(--paper-deep) [&_pre]:p-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        className,
      )}
    >
      {markdown}
    </div>
  );
}
