import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const s3Uploader = async (file, customPath = null) => {
  try {
    console.log("s3 file is", file.originalname);

    let fileName;
    if (customPath) {
      // Use custom path if provided
      fileName = customPath;
    } else {
      // Keep original filename first, then UUID for uniqueness
      const originalName = path.parse(file.originalname).name; // filename without extension
      const fileExtension = path.extname(file.originalname);
      const uuid = randomUUID();
      fileName = `${originalName}_${uuid}${fileExtension}`;
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(params));

    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteS3Object = async (fileUrl) => {
  try {
    if (!fileUrl) {
      return { success: true };
    }

    const urlParts = fileUrl.split("/");
    const key = urlParts[urlParts.length - 1];

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    await s3.send(new DeleteObjectCommand(params));

    return {
      success: true,
    };
  } catch (error) {
    console.error("S3 delete error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
