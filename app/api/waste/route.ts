// app/api/waste/route.ts
import { NextResponse } from "next/server";
import { ec2Client } from "@/lib/aws-clients";
import {
  DescribeInstancesCommand,
  DescribeVolumesCommand,
} from "@aws-sdk/client-ec2";

export async function GET() {
  try {
    // Unattached EBS volumes
    const volumesRes = await ec2Client.send(new DescribeVolumesCommand({
      Filters: [{ Name: "status", Values: ["available"] }],
    }));

    const unattachedVolumes = (volumesRes.Volumes || []).map((v) => {
      const tags  = Object.fromEntries(
        (v.Tags || []).map((t) => [t.Key, t.Value])
      );
      const price = v.VolumeType === "gp3" ? 0.08 : 0.10;
      return {
        id:           v.VolumeId,
        type:         v.VolumeType,
        sizeGb:       v.Size,
        monthlyCost:  parseFloat(((v.Size || 0) * price).toFixed(2)),
        team:         tags.Team        || "untagged",
        owner:        tags.Owner       || "untagged",
        environment:  tags.Environment || "untagged",
      };
    });

    // Running EC2 instances (for display — idle detection needs CloudWatch)
    const instancesRes = await ec2Client.send(new DescribeInstancesCommand({
      Filters: [{ Name: "instance-state-name", Values: ["running"] }],
    }));

    const runningInstances = (instancesRes.Reservations || [])
      .flatMap((r) => r.Instances || [])
      .map((i) => {
        const tags = Object.fromEntries(
          (i.Tags || []).map((t) => [t.Key, t.Value])
        );
        return {
          id:          i.InstanceId,
          type:        i.InstanceType,
          team:        tags.Team        || "untagged",
          environment: tags.Environment || "untagged",
          owner:       tags.Owner       || "untagged",
          launchTime:  i.LaunchTime,
        };
      });

    const totalWaste = unattachedVolumes.reduce(
      (sum, v) => sum + v.monthlyCost, 0
    );

    return NextResponse.json({
      unattachedVolumes,
      runningInstances,
      totalWaste: parseFloat(totalWaste.toFixed(2)),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}