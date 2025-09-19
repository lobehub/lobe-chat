CREATE TABLE "payments" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"order_code" varchar(64) NOT NULL,
	"description" text,
	"amount" integer NOT NULL,
	"currency" varchar(8) DEFAULT 'VND',
	"gateway" varchar(32) DEFAULT 'sepay',
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"transaction_id" varchar(64),
	"reference_code" varchar(128),
	"transaction_date" varchar(64),
	"gateway_response" jsonb,
	"paid_at" timestamp with time zone,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "payments_order_code_unique" ON "payments" USING btree ("order_code");