// lib/aws-clients.ts
import { CostExplorerClient } from "@aws-sdk/client-cost-explorer";
import { EC2Client } from "@aws-sdk/client-ec2";
import { BudgetsClient } from "@aws-sdk/client-budgets";
import { ComputeOptimizerClient } from "@aws-sdk/client-compute-optimizer";

const config = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
};

export const ceClient        = new CostExplorerClient(config);
export const ec2Client       = new EC2Client(config);
export const budgetsClient   = new BudgetsClient(config);
export const optimizerClient = new ComputeOptimizerClient(config);