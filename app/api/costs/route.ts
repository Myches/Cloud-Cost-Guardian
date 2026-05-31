import { NextResponse } from "next/server";
import { ceClient } from "@/lib/aws-clients";
import { GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer";

function getDateRange() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split("T")[0];
  const end   = now.toISOString().split("T")[0];

  if (start === end) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      start: new Date(yesterday.getFullYear(), yesterday.getMonth(), 1)
        .toISOString().split("T")[0],
      end,
    };
  }
  return { start, end };
}

function parseAmount(amount: string | undefined): number {
  return Math.abs(parseFloat(amount || "0"));
}

export async function GET() {
  try {
    const { start, end } = getDateRange();

    const [daily, byService, byTeam, byName] = await Promise.all([
      ceClient.send(new GetCostAndUsageCommand({
        TimePeriod:  { Start: start, End: end },
        Granularity: "DAILY",
        Metrics:     ["UnblendedCost"],
      })),
      ceClient.send(new GetCostAndUsageCommand({
        TimePeriod:  { Start: start, End: end },
        Granularity: "MONTHLY",
        Metrics:     ["UnblendedCost"],
        GroupBy:     [{ Type: "DIMENSION", Key: "SERVICE" }],
      })),
      ceClient.send(new GetCostAndUsageCommand({
        TimePeriod:  { Start: start, End: end },
        Granularity: "MONTHLY",
        Metrics:     ["UnblendedCost"],
        GroupBy:     [{ Type: "TAG", Key: "Team" }],
      })),
      ceClient.send(new GetCostAndUsageCommand({
        TimePeriod:  { Start: start, End: end },
        Granularity: "MONTHLY",
        Metrics:     ["UnblendedCost"],
        GroupBy:     [{ Type: "TAG", Key: "Name" }],
      })),
    ]);

    const trend = (daily.ResultsByTime || []).map((r) => ({
      date: r.TimePeriod?.Start || "",
      cost: parseAmount(r.Total?.UnblendedCost?.Amount),
    }));

    const services = (byService.ResultsByTime?.[0]?.Groups || [])
      .map((g) => ({
        name: g.Keys?.[0] || "Unknown",
        cost: parseAmount(g.Metrics?.UnblendedCost?.Amount),
      }))
      .filter((s) => s.cost > 0)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 8);

    const teamGroups = (byTeam.ResultsByTime?.[0]?.Groups || [])
      .filter((g) => {
        const key = g.Keys?.[0] || "";
        return key !== "Team$" && key !== "";
      });

    const nameGroups = (byName.ResultsByTime?.[0]?.Groups || [])
      .filter((g) => {
        const key = g.Keys?.[0] || "";
        return key !== "Name$" && key !== "";
      });

    const activeGroups = teamGroups.length > 0 ? teamGroups : nameGroups;

    const teams = activeGroups
      .map((g) => ({
        name: (g.Keys?.[0] || "Untagged")
          .replace("Team$", "")
          .replace("Name$", "") || "Untagged",
        cost: parseAmount(g.Metrics?.UnblendedCost?.Amount),
      }))
      .filter((t) => t.cost > 0);

    const total = services.reduce((sum, s) => sum + s.cost, 0);

    const topService = services[0]?.name
      ?.replace("Amazon ", "")
      ?.replace("AWS ", "")
      ?.replace(" - Compute", "")
      ?.replace(" - Other", "")
      || null;

    return NextResponse.json({
      total:      parseFloat(total.toFixed(8)),
      trend,
      services,
      teams,
      topService,
      hasData:    services.length > 0,
    });

  } catch (error: any) {
    console.error("Cost API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch cost data" },
      { status: 500 }
    );
  }
}