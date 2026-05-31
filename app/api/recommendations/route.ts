// app/api/recommendations/route.ts
import { NextResponse } from "next/server";
import { optimizerClient } from "@/lib/aws-clients";
import {
  GetEC2InstanceRecommendationsCommand,
} from "@aws-sdk/client-compute-optimizer";

export async function GET() {
  try {
    const response = await optimizerClient.send(
      new GetEC2InstanceRecommendationsCommand({})
    );

    const recommendations = (response.instanceRecommendations || []).map((r) => ({
      instanceArn:     r.instanceArn,
      instanceName:    r.instanceName,
      finding:         r.finding,
      currentType:     r.currentInstanceType,
      recommendedType: r.recommendationOptions?.[0]?.instanceType || "N/A",
      estimatedSaving: parseFloat(
        r.recommendationOptions?.[0]
          ?.savingsOpportunity?.estimatedMonthlySavings?.value?.toFixed(2) || "0"
      ),
    }));

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}