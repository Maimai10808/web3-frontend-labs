import { NextResponse } from "next/server";
import {
  uploadFileToPinata,
  uploadJsonToPinata,
} from "@/lib/ipfs/pinata-client";

type UploadMetadataBody = {
  metadata: Record<string, unknown>;
};

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json(
          { ok: false, message: "Missing file in formData." },
          { status: 400 },
        );
      }

      const uploaded = await uploadFileToPinata(file);

      return NextResponse.json({
        ok: true,
        type: "file",
        ipfsHash: uploaded.ipfsHash,
        gatewayUrl: uploaded.gatewayUrl,
      });
    }

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as UploadMetadataBody;

      if (!body.metadata || typeof body.metadata !== "object") {
        return NextResponse.json(
          { ok: false, message: "Missing metadata payload." },
          { status: 400 },
        );
      }

      const uploaded = await uploadJsonToPinata(body.metadata);

      return NextResponse.json({
        ok: true,
        type: "json",
        ipfsHash: uploaded.ipfsHash,
        gatewayUrl: uploaded.gatewayUrl,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Unsupported content type.",
      },
      { status: 415 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "IPFS upload failed.",
      },
      { status: 500 },
    );
  }
}
