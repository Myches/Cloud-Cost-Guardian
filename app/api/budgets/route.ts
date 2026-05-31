import { NextResponse } from "next/server";
import { budgetsClient } from "@/lib/aws-clients";
import { DescribeBudgetsCommand } from "@aws-sdk/client-budgets";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

export async function GET() {
  try {
    const sts       = new STSClient({ region: "us-east-1" });
    const identity  = await sts.send(new GetCallerIdentityCommand({}));
    const accountId = identity.Account!;

    const response = await budgetsClient.send(
      new DescribeBudgetsCommand({ AccountId: accountId })
    );

    const budgets = (response.Budgets || [])
      // Filter out AWS auto-created default budgets
      .filter((b) => {
        const name = b.BudgetName || "";
        return (
          name !== "My Cost Budget" &&
          !name.startsWith("AWS/") &&
          b.BudgetLimit?.Amount !== "0.01"
        );
      })
      .map((b) => {
        const limit    = parseFloat(b.BudgetLimit?.Amount    || "0");
        const actual   = parseFloat(
          b.CalculatedSpend?.ActualSpend?.Amount    || "0"
        );
        const forecast = parseFloat(
          b.CalculatedSpend?.ForecastedSpend?.Amount || "0"
        );
        const pct = limit > 0 ? Math.round((actual / limit) * 100) : 0;

        return {
          name:     b.BudgetName || "Unknown",
          // Clean up the terraform-generated name for display
          label: (b.BudgetName || "")
            .replace("cloudcost-guardian-", "")
            .replace("-monthly-budget", "")
            .replace(/-/g, " "),
          limit,
          actual:   parseFloat(actual.toFixed(4)),
          forecast: parseFloat(forecast.toFixed(4)),
          pct,
          status:
            pct >= 100 ? "critical" :
            pct >= 80  ? "warning"  : "ok",
        };
      });

    return NextResponse.json({ budgets });
  } catch (error: any) {
    console.error("Budgets API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}