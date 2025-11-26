import { SectionDataTable } from "@/components/section-data-table";
import { SectionTitle } from "@/components/section-title";
import { CodeBlock } from "@/components/ui/code-block";
import { WebhookDetailHeader } from "@/components/webhook-detail-header";
import { useGetApiWebhooksIdSuspense } from "@/http/generated";

interface WebhookDetailsProps {
	id: string;
}

export function WebhookDetails({ id }: WebhookDetailsProps) {
	const { data: webhook } = useGetApiWebhooksIdSuspense(id);

	const overviewData = [
		{ key: "Method", value: webhook.method },
		{ key: "Status Code", value: webhook.statusCode.toString() },
		{
			key: "Content-Type",
			value: webhook.contentType ?? "N/A",
		},
		{
			key: "Content-Length",
			value: webhook.contentLength ? `${webhook.contentLength} bytes` : "N/A",
		},
		{ key: "IP Address", value: webhook.ip },
		{ key: "Pathname", value: webhook.pathname },
	];

	const queryParams =
		webhook.queryParams && typeof webhook.queryParams === "object"
			? Object.entries(webhook.queryParams).map(([key, value]) => ({
					key,
					value: String(value),
				}))
			: [];

	const headers =
		webhook.headers && typeof webhook.headers === "object"
			? Object.entries(webhook.headers).map(([key, value]) => ({
					key,
					value: String(value),
				}))
			: [];

	const bodyContent = webhook.body ?? "";

	return (
		<div className="flex h-full flex-col">
			<WebhookDetailHeader
				method={webhook.method}
				pathname={webhook.pathname}
				ip={webhook.ip}
				createdAt={webhook.createdAt}
			/>

			<div className="flex-1 overflow-y-auto">
				<div className="space-y-6 p-6">
					<div className="space-y-4">
						<SectionTitle>Request Overview</SectionTitle>

						<SectionDataTable data={overviewData} />
					</div>

					<div className="space-y-4">
						<SectionTitle>Query Parameters</SectionTitle>

						{queryParams.length > 0 ? (
							<SectionDataTable data={queryParams} />
						) : (
							<p className="text-sm text-muted-foreground">
								No query parameters
							</p>
						)}
					</div>

					<div className="space-y-4">
						<SectionTitle>Headers</SectionTitle>

						<SectionDataTable data={headers} />
					</div>

					<div className="space-y-4">
						<SectionTitle>Request Body</SectionTitle>

						{bodyContent ? (
							<CodeBlock code={bodyContent} />
						) : (
							<p className="text-sm text-muted-foreground">No request body</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
