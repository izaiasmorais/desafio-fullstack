import { faker } from "@faker-js/faker";
import { db } from ".";
import { webhooks } from "./schema";

const STRIPE_EVENTS = [
	"charge.succeeded",
	"charge.failed",
	"charge.refunded",
	"payment_intent.succeeded",
	"payment_intent.payment_failed",
	"payment_intent.canceled",
	"invoice.payment_succeeded",
	"invoice.payment_failed",
	"invoice.created",
	"invoice.finalized",
	"customer.subscription.created",
	"customer.subscription.updated",
	"customer.subscription.deleted",
	"customer.created",
	"customer.updated",
	"customer.deleted",
	"checkout.session.completed",
	"checkout.session.expired",
	"payout.paid",
	"payout.failed",
];

const HTTP_METHODS = ["POST", "GET", "PUT", "DELETE", "PATCH"];

function generateStripeWebhookBody(eventType: string) {
	const baseEvent = {
		id: `evt_${faker.string.alphanumeric(24)}`,
		object: "event",
		api_version: "2024-11-20",
		created: faker.date.recent({ days: 30 }).getTime() / 1000,
		type: eventType,
		livemode: false,
		pending_webhooks: faker.number.int({ min: 0, max: 3 }),
		request: {
			id: `req_${faker.string.alphanumeric(24)}`,
			idempotency_key: faker.string.uuid(),
		},
	};

	if (eventType.startsWith("charge.")) {
		return {
			...baseEvent,
			data: {
				object: {
					id: `ch_${faker.string.alphanumeric(24)}`,
					object: "charge",
					amount: faker.number.int({ min: 1000, max: 50000 }),
					currency: "usd",
					customer: `cus_${faker.string.alphanumeric(24)}`,
					description: faker.commerce.productDescription(),
					status: eventType === "charge.succeeded" ? "succeeded" : "failed",
					receipt_email: faker.internet.email(),
					created: faker.date.recent({ days: 30 }).getTime() / 1000,
				},
			},
		};
	}

	if (eventType.startsWith("payment_intent.")) {
		return {
			...baseEvent,
			data: {
				object: {
					id: `pi_${faker.string.alphanumeric(24)}`,
					object: "payment_intent",
					amount: faker.number.int({ min: 1000, max: 50000 }),
					currency: "usd",
					customer: `cus_${faker.string.alphanumeric(24)}`,
					description: faker.commerce.productDescription(),
					status:
						eventType === "payment_intent.succeeded"
							? "succeeded"
							: eventType === "payment_intent.canceled"
								? "canceled"
								: "requires_payment_method",
					created: faker.date.recent({ days: 30 }).getTime() / 1000,
				},
			},
		};
	}

	if (eventType.startsWith("invoice.")) {
		return {
			...baseEvent,
			data: {
				object: {
					id: `in_${faker.string.alphanumeric(24)}`,
					object: "invoice",
					amount_due: faker.number.int({ min: 1000, max: 100000 }),
					amount_paid:
						eventType === "invoice.payment_succeeded"
							? faker.number.int({ min: 1000, max: 100000 })
							: 0,
					currency: "usd",
					customer: `cus_${faker.string.alphanumeric(24)}`,
					customer_email: faker.internet.email(),
					status:
						eventType === "invoice.payment_succeeded"
							? "paid"
							: eventType === "invoice.payment_failed"
								? "open"
								: "draft",
					created: faker.date.recent({ days: 30 }).getTime() / 1000,
				},
			},
		};
	}

	if (eventType.startsWith("customer.subscription.")) {
		return {
			...baseEvent,
			data: {
				object: {
					id: `sub_${faker.string.alphanumeric(24)}`,
					object: "subscription",
					customer: `cus_${faker.string.alphanumeric(24)}`,
					status: eventType.includes("deleted")
						? "canceled"
						: eventType.includes("created")
							? "active"
							: "active",
					current_period_start: faker.date.recent({ days: 30 }).getTime() / 1000,
					current_period_end: faker.date.future().getTime() / 1000,
					plan: {
						id: `plan_${faker.string.alphanumeric(24)}`,
						amount: faker.number.int({ min: 1000, max: 10000 }),
						currency: "usd",
						interval: faker.helpers.arrayElement(["month", "year"]),
					},
				},
			},
		};
	}

	if (eventType.startsWith("customer.") && !eventType.includes("subscription")) {
		return {
			...baseEvent,
			data: {
				object: {
					id: `cus_${faker.string.alphanumeric(24)}`,
					object: "customer",
					email: faker.internet.email(),
					name: faker.person.fullName(),
					description: faker.company.name(),
					created: faker.date.recent({ days: 30 }).getTime() / 1000,
				},
			},
		};
	}

	if (eventType.startsWith("checkout.session.")) {
		return {
			...baseEvent,
			data: {
				object: {
					id: `cs_${faker.string.alphanumeric(24)}`,
					object: "checkout.session",
					amount_total: faker.number.int({ min: 1000, max: 50000 }),
					currency: "usd",
					customer: `cus_${faker.string.alphanumeric(24)}`,
					customer_email: faker.internet.email(),
					payment_status:
						eventType === "checkout.session.completed" ? "paid" : "unpaid",
					status:
						eventType === "checkout.session.completed" ? "complete" : "expired",
					created: faker.date.recent({ days: 30 }).getTime() / 1000,
				},
			},
		};
	}

	if (eventType.startsWith("payout.")) {
		return {
			...baseEvent,
			data: {
				object: {
					id: `po_${faker.string.alphanumeric(24)}`,
					object: "payout",
					amount: faker.number.int({ min: 10000, max: 500000 }),
					currency: "usd",
					status: eventType === "payout.paid" ? "paid" : "failed",
					arrival_date: faker.date.future().getTime() / 1000,
					created: faker.date.recent({ days: 30 }).getTime() / 1000,
				},
			},
		};
	}

	return {
		...baseEvent,
		data: {
			object: {
				id: faker.string.alphanumeric(24),
			},
		},
	};
}

async function seed() {
	console.log("🌱 Seeding database with Stripe webhooks...");

	const webhooksData = [];

	for (let i = 0; i < 60; i++) {
		const eventType = faker.helpers.arrayElement(STRIPE_EVENTS);
		const method = faker.helpers.arrayElement(HTTP_METHODS);
		const body = generateStripeWebhookBody(eventType);
		const pathname = `/webhooks/stripe/${faker.helpers.arrayElement(["production", "test", "sandbox"])}`;

		const stripeHeaders = {
			"content-type": "application/json",
			"stripe-signature": `t=${Date.now()},v1=${faker.string.alphanumeric(64)}`,
			"user-agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
			"x-stripe-webhook-id": `whsec_${faker.string.alphanumeric(32)}`,
			accept: "*/*",
			host: faker.internet.domainName(),
		};

		webhooksData.push({
			method,
			pathname,
			ip: faker.internet.ipv4(),
			statusCode: faker.helpers.arrayElement([200, 201, 400, 500]),
			contentType: "application/json",
			contentLength: JSON.stringify(body).length,
			queryParams: faker.datatype.boolean()
				? {
						webhook_id: faker.string.uuid(),
						test: "true",
					}
				: null,
			headers: stripeHeaders,
			body: JSON.stringify(body, null, 2),
			createdAt: faker.date.recent({ days: 7 }),
		});
	}

	await db.insert(webhooks).values(webhooksData);

	console.log(`✅ Successfully seeded ${webhooksData.length} webhooks!`);
	process.exit(0);
}

seed().catch((error) => {
	console.error("❌ Error seeding database:", error);
	process.exit(1);
});
