import React, { useEffect } from "react";
import { codeToHtml } from "shiki";
import { twMerge } from "tailwind-merge";

interface CodeBlockProps extends React.ComponentProps<"div"> {
	code: string;
	language?: string;
}

export function CodeBlock({
	className,
	code,
	language = "json",
	...props
}: CodeBlockProps) {
	const [parsedCode, setParsedCode] = React.useState<string>("");

	useEffect(() => {
		if (code) {
			codeToHtml(code, { lang: language, theme: "min-dark" }).then((parsed) =>
				setParsedCode(parsed),
			);
		}
	}, [code, language]);

	return (
		<div
			className={twMerge(
				"relative rounded-lg border border-zinc-700 overflow-x-auto",
				className,
			)}
			{...props}
		>
			<div
				className="[&_pre]:p-4 text-sm font-mono leading-relaxed"
				dangerouslySetInnerHTML={{ __html: parsedCode }}
			/>
		</div>
	);
}
