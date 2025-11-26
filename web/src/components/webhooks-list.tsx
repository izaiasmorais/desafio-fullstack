import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { getApiWebhooksQueryKey } from "../http/generated";
import { getApiWebhooks } from "../http/generated/axios/getApiWebhooks";
import { WebhooksListItem } from "./webhooks-list-item";

function useInfiniteResources() {
	return useSuspenseInfiniteQuery({
		queryKey: getApiWebhooksQueryKey(),
		queryFn: async ({ pageParam }) => {
			return getApiWebhooks({ cursor: pageParam });
		},
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		initialPageParam: undefined as string | undefined,
	});
}

export function WebhooksList() {
	const loadMoreRef = useRef<HTMLDivElement | null>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);
	const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useInfiniteResources();

	const webhooks = data.pages.flatMap((page) => page.webhooks);

	useEffect(() => {
		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		observerRef.current = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];

				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{
				threshold: 0.1,
			},
		);

		if (loadMoreRef.current) {
			observerRef.current.observe(loadMoreRef.current);
		}

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	return (
		<div className="flex-1 overflow-y-auto">
			<div className="space-y-1 p-2">
				{webhooks.map((webhook) => {
					return <WebhooksListItem key={webhook.id} webhook={webhook} />;
				})}
			</div>

			{hasNextPage && (
				<div className="p-2" ref={loadMoreRef}>
					{true && (
						<div className="flex items-center justify-center py-2">
							<Loader2 className="size-5 animate-spin text-zinc-500" />
						</div>
					)}
				</div>
			)}
		</div>
	);
}
