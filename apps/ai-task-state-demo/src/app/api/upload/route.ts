import { NextResponse } from "next/server";
import { validateUploadFileMeta } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          message: "Missing file upload.",
        },
        { status: 400 },
      );
    }

    const parsed = validateUploadFileMeta({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid upload file.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const uploaded = {
      name: file.name,
      type: file.type,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
    };

    return NextResponse.json({
      file: uploaded,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Upload failed.",
      },
      { status: 500 },
    );
  }
}
