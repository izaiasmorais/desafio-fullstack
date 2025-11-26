import { useGetApiWebhooksSuspense } from "../http/generated";
import { WebhooksListItem } from "./webhooks-list-item";

export function WebhooksList() {
	const { data } = useGetApiWebhooksSuspense();

	return (
		<div className="flex-1 overflow-y-auto">
			<div className="space-y-1 p-2">
				{data.webhooks.map((webhook) => {
					return <WebhooksListItem key={webhook.id} webhook={webhook} />;
				})}
			</div>
		</div>
	);
}
